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
      const LocationsCollection_Second = db.collection("second locations")

      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })

      //the list of photos when user submit the first time
      app.get("/getPictures", async (req, res) => {
            const locations = await LocationsCollection.find().toArray()
            res.send(locations)
      })

      //the list of the photo of the user when they click like
      app.get("/getLikedPictures", async (req, res) => {
            const locations = await LocationsCollection_Second.find().toArray()
            res.send(locations)
      })

      //adds to the LocationsCollections. This is the initial one
      app.post("/putPictures", async (req, res) => {

            const { destination, location } = req.body

            const { picURL } = await getTravelAdvisorPic(destination, location)

            //adding it to collection
            const newLocation = {
                  destination: destination,
                  location: location,
                  picture: picURL,
            }
            await LocationsCollection.insertOne(newLocation)
            res.send({ status: 'This picture is listed' })
      })

      //adds to the LocatonsCollections. This is the liked photos
      app.post("/putLikedPictures", async (req, res) => {

            const { destination, location } = req.body

            const { picURL } = await getTravelAdvisorPic(destination, location)

            //adding it to collection
            const newLocation = {
                  destination: destination,
                  location: location,
                  picture: picURL,
            }
            await LocationsCollection_Second.insertOne(newLocation)
            res.send({ status: 'This picture is liked!' })
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