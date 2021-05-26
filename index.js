//opens up a server
const express = require('express')
const app = express()

//require cors so front end can access to to our backend
const cors = require('cors')
app.use(cors())

//require fetch
const fetch = require('node-fetch')

//use json so we can access body
app.use(express.json())

//require the travel advisor
const { getTravelAdvisorPic } = require('./travel')

//password is in a .env file
require('dotenv').config()

//user mongoclient for database
const { MongoClient, ObjectID } = require("mongodb")

//our port
const PORT = process.env.PORT || 3000

//connection string for mongo atlas
const connection_string = `mongodb+srv://admin:${process.env.PW}@cluster0.4v0gp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

//useUnifiedTopology to get rid of the warning
//this is where the CRUD will all happen
MongoClient.connect(`${connection_string}`, { useUnifiedTopology: true }, (err, client) => {
      if (err) return console.error(err)

      const db = client.db(`${process.env.DB_NAME}`)

      //a collection inside free99 database
      const LocationsCollection = db.collection("locations")

      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })

      //test to check if pictures are in the database
      app.get("/display20pictures", async (req, res) => {
            const locations = await LocationsCollection.find().toArray()
            res.send(locations)
      })

      //put 20 pictures for the front end
      app.post("/put20pictures", async (req, res) => {

            const { destination, location } = req.body

            const { picURL } = await getTravelAdvisorPic(destination, location)

            //adding it to collection
            const newLocation = {
                  destination: destination,
                  location: location,
                  picture: picURL,
            }
            await LocationsCollection.insertOne(newLocation)
            res.send({ status: '1 picture listed' })
      })

      //this will add to the final review
      //only going to be one picture
      app.post("/finalReview", async (req, res) => {

            const { destination, location } = req.body

            const { locationId } = await getTravelAdvisorPic(destination, location)

            const recommendation = `https://www.tripadvisor.com/Attractions-g${locationId}-Activities-${destination}-${location}`

            res.send({ recommendation })
      })

      //deletes an item with a given ID
      app.delete("/location/:id", async (req, res) => {
            await LocationsCollection.deleteOne({ "_id": ObjectID(req.params.id) })
            res.send({ status: "deleted" })
      })
})