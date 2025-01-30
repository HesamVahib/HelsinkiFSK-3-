const express = require('express')
const morgan = require('morgan')
const Persons = require('./models/persons')

const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))
const customFormat = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan(customFormat))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/api/persons', (request, response, next) => {
  Persons.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  const date = new Date()

  Persons.find({}).then((persons) => {
    const message = `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
    response.send(message).end()
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Persons.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).json({ error: 'person not found' })
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Persons.findByIdAndDelete(id)
    .then((person) => {
      if (person) {
        response.status(204).end()
      }
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  Persons.findOne({ name: body.name })
    .then((person) => {
      if (person) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const newPerson = new Persons({
        name: body.name,
        number: body.number,
      })

      return newPerson.save()
    })
    .then((savedPerson) => {
      if (savedPerson) response.json(savedPerson)
    })
    .catch((error) => next(error))

  console.log(JSON.stringify(body))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Persons.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT)
console.log(`Server running on port ${PORT}`)
