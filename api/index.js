require("dotenv").config();
require("./mongo");

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const express = require("express");
const app = express();
const cors = require("cors");
const Note = require("./models/Note");
const User = require("./models/User");

const notFound = require("./middleware/notFound");
const handleErrors = require("./middleware/handleErrors");
const userExtractor = require("./middleware/userExtractor");

const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

app.use(cors());
app.use(express.json());
app.use(express.static("../app/build"));

Sentry.init({
  dsn: "https://ac034ebd99274911a8234148642e044c@o537348.ingest.sentry.io/5655435",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.get("/api/notes", async (reuqest, response) => {
  const notes = await Note.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(notes);
});

app.get("/api/notes/:id", (request, response, next) => {
  const { id } = request.params;

  Note.findById(id)
    .then((note) => {
      if (note) return response.json(note);
      response.status(404).end();
    })
    .catch((err) => {
      next(err);
    });
});

app.put("/api/notes/:id", userExtractor, (request, response, next) => {
  const { id } = request.params;
  const note = request.body;

  const newNoteInfo = {
    content: note.content,
    important: note.important,
  };

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/api/notes/:id", userExtractor, async (request, response, next) => {
  const { id } = request.params;

  const res = await Note.findByIdAndDelete(id);
  if (res === null) return response.status(404);

  response.status(204).end();
});

app.post("/api/notes", userExtractor, async (request, response, next) => {
  const { content, important = false } = request.body;

  const { userID } = request;

  const user = await User.findById(userID);

  if (!content) {
    return response.status(400).json({
      error: "required 'content' field is missing",
    });
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id,
  });

  try {
    const savedNote = await newNote.save();

    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    response.json(savedNote);
  } catch (error) {
    next(error);
  }
});

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testinRouter = require("./controllers/testing");
  app.use("/api/testing", testinRouter);
}

app.use(notFound);

app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
