require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");
const url = process.env.MONGODB_URI;
const password = process.argv[2];

app.use(cors());
app.use(express.static("dist"));
app.use(morgan("tiny"));

app.get("/", (request, response) => {
  response.send("<h1>this is the phonebook boss</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response) => {
  let weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let d = new Date();
  let date = `${weekday[d.getDay()]} ${
    month[d.getMonth()]
  } ${d.getUTCDate()} ${d.getFullYear()} ${d.toLocaleTimeString()}`;
  Person.find({}).then((persons) => {
    const info = {
      people: persons.length,
      date: date,
    };
    response.send(info);
  });
});

app.use(express.json());

morgan.token("sirname", function (req, res) {
  return "{ name: " + req.body["name"] + ", ";
});
morgan.token("number", function (req, res) {
  return "number: " + req.body["number"] + " }";
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.sirname(req, res),
      tokens.number(req, res),
    ].join(" ");
  })
);

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === null || body.number === null) {
    return response.status(400).json({ error: "name or number missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    console.log(savedPerson);
    response.json(savedPerson);
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
