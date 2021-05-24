//opens up a server
const express = require('express')
const app = express()

//use json so we can access body
app.use(express.json())

//password is in a .env file
require('dotenv').config()

//user mongoclient for database
const { MongoClient } = require("mongodb")

//our port
const PORT = process.env.PORT || 3000
const databaseName = "TeamFree99Database"

//connection string for mongo atlas
const connection_string = `mongodb+srv://admin:${process.env.PW}@cluster0.4v0gp.mongodb.net/${databaseName}?retryWrites=true&w=majority`

//useUnifiedTopology to get rid of the warning
//this is where the CRUD will all happen
MongoClient.connect(`${connection_string}`, { useUnifiedTopology: true }, (err, client) => {
      if (err) return console.error(err)

      const db = client.db('TeamFree99Database')
      const namesCollection = db.collection('names')
      const locationsCollection = db.collection('locations')


      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })


      //has to be async so we can get the data from namesCollection
      app.get("/test", async (req, res) => {
            const outputNames = await namesCollection.find().toArray()
            const outputLocations = await locationsCollection.find().toArray()

            console.log({ outputNames, outputLocations })
            res.send({ status: 'Check' })
      })

      app.post("/test", (req, res) => {
            namesCollection.insertOne(req.body)
            res.send({ status: 'Submitted' })
      })


})