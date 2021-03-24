const express = require("express");

const { v4: uuid_v4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existingUser = users.find((user) => user.username === username);

  if (!existingUser) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.existingUser = existingUser;
  return next();
}

app.post("/user", (request, response) => {
  const { username } = request.headers;
  const { name } = request.body;

  const verifyIfUsernameExists = users.find(
    (users) => users.username === username
  );

  if (verifyIfUsernameExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const user = {
    id: uuid_v4(),
    name,
    username,
    todos: [],
  };

  users.push(user);
  return response.status(201).send();
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { existingUser } = request;

  response.json(existingUser.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
  const { existingUser } = request;
  const { title, deadline } = request.body;

  const todos = {
    id: uuid_v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  existingUser.todos.push(todos);

  response.status(201).json(todos);
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { existingUser } = request;
  const { title, deadline } = request.body;

  const check_id = existingUser.todos.find((todos) => todos.id === id);

  if (!check_id) {
    return response.status(401).json({ error: "Todo not found!" });
  }

  check_id.title = title;
  check_id.deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
  const { existingUser } = request;
  const { id } = request.params;

  const check_id = existingUser.todos.find((todos) => todos.id === id);

  if (!check_id) {
    return response.status(401).json({ error: "Todo not found!" });
  }

  check_id.done = true;

  return response.json(check_id);
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { existingUser } = request;
  const { id } = request.params;

  const check_idIndex = existingUser.todos.findIndex(
    (todos) => todos.id === id
  );

  if (check_idIndex < 0) {
    return response.status(401).json({ error: "Todo not found!" });
  }

  existingUser.todos.splice(check_idIndex, 1);

  response.status(201).send();
});

app.listen(3333, () => {
  console.log("Server 🏃");
});
