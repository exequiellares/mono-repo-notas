const mongoose = require("mongoose");
const { server } = require("..");
const Note = require("../models/Note");
const { initialNote, api, getAllContentFromNotes } = require("./helpers");

beforeEach(async () => {
  await Note.deleteMany({});

  // sequential
  for (const note of initialNote) {
    const noteObject = new Note(note);
    await noteObject.save();
  }
});

describe("GET all notes", () => {
  test("notes are returned as json", async () => {
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are two notes", async () => {
    const response = await api.get("/api/notes");

    expect(response.body).toHaveLength(initialNote.length);
  });

  test("the first note is about axel", async () => {
    const { contents } = await getAllContentFromNotes();

    expect(contents).toContain("Hola Axel");
  });
});

describe("POST a note", () => {
  test("is possible with a valid note", async () => {
    const newNote = {
      content: "Bienvenido",
      important: true,
    };

    await api
      .post("/api/notes")
      .send(newNote)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const { contents, response } = await getAllContentFromNotes();

    expect(response.body).toHaveLength(initialNote.length + 1);

    expect(contents).toContain(newNote.content);
  });

  test("is not possible with an invalid note", async () => {
    const newNote = {
      important: true,
    };

    await api.post("/api/notes").send(newNote).expect(400);

    const response = await api.get("/api/notes");

    expect(response.body).toHaveLength(initialNote.length);
  });
});

describe("DELETE a note", () => {
  test("a note can be deleted", async () => {
    const { response: firstResponse } = await getAllContentFromNotes();
    const { body: notes } = firstResponse;
    const noteToDelete = notes[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const { contents, response: secondResponse } =
      await getAllContentFromNotes();

    expect(secondResponse.body).toHaveLength(initialNote.length - 1);

    expect(contents).not.toContain(noteToDelete.content);
  });

  test("a note that has an invalid id can not be deleted", async () => {
    await api.delete("/api/notes/1234").expect(404);

    const { response } = await getAllContentFromNotes();

    expect(response.body).toHaveLength(initialNote.length);
  });

  test("a note that has a valid id but do not exist can not be deleted", async () => {
    const validObjectIdThatDoNotExist = "60451827152dc22ad768f442";
    await api.delete(`/api/notes/${validObjectIdThatDoNotExist}`).expect(204);

    const { response } = await getAllContentFromNotes();

    expect(response.body).toHaveLength(initialNote.length);
  });
});

afterAll(() => {
  server.close();
  mongoose.connection.close();
});
