const { app } = require("..");
const supertest = require("supertest");
const User = require("../models/User");

const api = supertest(app);

const initialNote = [
  {
    content: "Hola Axel",
    important: true,
    date: new Date(),
  },
  {
    content: "Chau axel",
    important: true,
    date: new Date(),
  },
];

const getAllContentFromNotes = async () => {
  const response = await api.get("/api/notes");
  return {
    contents: response.body.map((note) => note.content),
    response,
  };
};

const getUsers = async () => {
  const usersDB = await User.find({});
  return usersDB.map((user) => user.toJSON());
};

module.exports = { initialNote, api, getAllContentFromNotes, getUsers };
