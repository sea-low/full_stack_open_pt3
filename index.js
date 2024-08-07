const http = require("http");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

//to phonebook: cd ../full_stack_open_clo/part2/phonebook/
//to fso:  cd ../../../fso_pt3/

app.use(cors());
app.use(express.static("dist"));
app.use(morgan("tiny"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>this is the phonebook boss</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  person ? response.json(person) : response.status(404).end();
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
  let psa = `Phonebook has info for ${persons.length} people`;
  let date = `${weekday[d.getDay()]} ${
    month[d.getMonth()]
  } ${d.getUTCDate()} ${d.getFullYear()} ${d.toLocaleTimeString()}`;
  response.send(`<p>${psa}<p><p>${date}<p>`);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};

app.use(express.json());

morgan.token("sirname", function (req, res) {
  return "{ name: " + req.body["name"] + ", ";
});
morgan.token("telephone", function (req, res) {
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
      tokens.telephone(req, res),
    ].join(" ");
  })
);

app.post("/api/persons", (request, response) => {
  const body = request.body;

  console.log(persons.find((x) => x === body.name));
  if (persons.find((x) => x.name === body.name)) {
    return response.status(500).json({
      error: "name must be unique",
    });
  }

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  return response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
