const bcrypt = require("bcrypt");
const User = require("../models/User");
const { api, getUsers } = require("./helpers");
const mongoose = require("mongoose");
const { server } = require("..");

describe("creating a new user", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("psw", 10);
    const user = new User({ username: "axelroot", passwordHash });

    await user.save();
  });

  test("works as expected creating a fresh username", async () => {
    const usersAtStart = await getUsers();

    const newUser = {
      username: "axeldev",
      name: "Axel",
      password: "twich",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await getUsers();

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username is already taken", async () => {
    const usersAtStart = await getUsers();

    const newUser = {
      username: "axelroot",
      name: "Axel",
      password: "axeltest",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.errors.username.message).toContain(
      "`username` to be unique"
    );

    const usersAtEnd = await getUsers();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
