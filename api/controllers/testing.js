const testinRouter = require("express").Router();
const Note = require("../models/Note");
const User = require("../models/User");

testinRouter.post("/reset", async (request, response) => {
  await Note.deleteMany({});
  await User.deleteMany({});

  response.json(204).end;
});

module.exports = testinRouter;
