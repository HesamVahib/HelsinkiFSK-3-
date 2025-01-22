const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body));
const customFormat = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(morgan(customFormat))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const randomId = () => {
  const random = Math.floor(Math.random() * 100000)
  while (persons.find(person => person.id === random)) {
    random = Math.floor(Math.random() * 100000)
  }
  return random
}

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const date = new Date()
  const message = `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
  response.send(message).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' })
  }
  const newPerson = {
    id: randomId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(newPerson)
  response.json(newPerson)
  console.log(JSON.stringify(body))
})

app.use(unknownEndpoint)

const PORT = 3001

app.listen(PORT)
console.log(`Server running on port ${PORT}`)
