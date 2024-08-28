require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const app = express()
const Person = require('./models/person')
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(cors())
app.use(express.static('dist'))
app.use(morgan('tiny'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>this is the phonebook boss</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      person ? response.json(person) : response.status(404).end()
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((request) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.get('/api/info', (request, response) => {
  let weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  let month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  let d = new Date()
  let date = `${weekday[d.getDay()]} ${
    month[d.getMonth()]
  } ${d.getUTCDate()} ${d.getFullYear()} ${d.toLocaleTimeString()}`
  Person.find({}).then((persons) => {
    const info = {
      people: persons.length,
      date: date,
    }
    response.send(info)
  })
})

app.use(express.json())

morgan.token('sirname', function (req) {
  return '{ name: ' + req.body['name'] + ', '
})
morgan.token('number', function (req) {
  return 'number: ' + req.body['number'] + ' }'
})

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.sirname(req, res),
      tokens.number(req, res),
    ].join(' ')
  })
)

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // if (body.name.length === 0 || body.number.length === 0) {
  //   return response.status(400).json({ error: 'name or number missing' })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      console.log(savedPerson.id)
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      // upon creating a new person, updating right after it throws 'id is NAN'
      // if I click update a second time, it will update
      // trying to update a pre-existing updates without a sweat
      // •~•?

      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
