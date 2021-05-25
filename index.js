//opens up a server
const express = require('express')
const app = express()

//require fetch
const fetch = require('node-fetch')

//use json so we can access body
app.use(express.json())

//password is in a .env file
require('dotenv').config()

//user mongoclient for database
const { MongoClient, ObjectID } = require("mongodb")

//our port
const PORT = process.env.PORT || 3000
const databaseName = "TeamFree99Database"

//connection string for mongo atlas
const connection_string = `mongodb+srv://admin:${process.env.PW}@cluster0.4v0gp.mongodb.net/${databaseName}?retryWrites=true&w=majority`

//api URL for unsplash
const unsplashURL = `https://api.unsplash.com/search/photos/?client_id=${process.env.API_KEY_UNSPLASH}&query=`

//useUnifiedTopology to get rid of the warning
//this is where the CRUD will all happen
MongoClient.connect(`${connection_string}`, { useUnifiedTopology: true }, (err, client) => {
      if (err) return console.error(err)

      const db = client.db(`${databaseName}`)
      const destinationsCollection = db.collection('destinations')
      const locationsCollection = db.collection('locations')


      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })


      //has to be async so we can get the data from namesCollection
      app.get("/test", async (req, res) => {
            // const outputNames = namesCollection.find().toArray()
            // const outputLocations = locationsCollection.find().toArray()

            const output = await locationsCollection.find().toArray()
            console.log(output)
            res.send({ status: 'check!' })
      })

      //
      app.post("/test", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location } = req.body

            //getting api request through node-fetch
            fetch(`${unsplashURL}${destination} ${location}`).then((response) => response.json()).then((picture) => {
                  //namesCollection.insertOne()

                  const picURL = picture.results[0].urls.thumb

                  destinationsCollection.insertOne({
                        destination: destination,
                        location: location,
                        picture: picURL
                  })
            })
            res.send({ status: 'Submitted' })
      })

      app.delete("/test/:id", (req, res) => {

            destinationsCollection.deleteOne({ "_id": ObjectID(req.params.id) })

            res.send({ status: "deleted" })
      })

      app.put("/test/:id", (req, res) => {

            const { destination, location } = req.body

            //getting api request through node-fetch
            fetch(`${unsplashURL}${destination} ${location}`).then((response) => response.json()).then((picture) => {

                  const picURL = picture.results[0].urls.thumb

                  destinationsCollection.findOneAndUpdate({ "_id": ObjectID(req.params.id) }, {
                        $set: {
                              destination: destination,
                              location: location,
                              picture: picURL
                        }
                  })

            })
            res.send({ status: 'updated' })
      })

})