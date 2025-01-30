const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://hesamvahib:${password}@fullstack.bh3dg.mongodb.net/PhoneBook?retryWrites=true&w=majority&appName=Fullstack`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', noteSchema)

const personNAme = process.argv[3]
const personNumber = process.argv[4]

const person = new Person({
  name: personNAme,
  number: personNumber,
})

if (process.argv.length === 5) {
  person.save().then(() => {
    console.log(`added ${personNAme} number ${personNumber} to phonebook`)
    mongoose.connection.close()
  })
}

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((note) => {
      console.log(`${note.name} ${note.number}`)
    })
    mongoose.connection.close()
  })
}
