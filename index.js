//opens up a server
const express = require('express')
const app = express()

//require cors so front end can to to our backend
const cors = require('cors')
app.use(cors())

//require fetch
const fetch = require('node-fetch')

//use json so we can access body
app.use(express.json())

//require unirest for travel advisor api
const unirest = require("unirest");

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

      //this two are test
      const destinationsCollection = db.collection('destinations')
      const locationsCollection = db.collection('locations')

      //this will hold some data out of the 20 pictures that the user likes
      const firstReviewLikes = db.collection('firstReviewLikes')

      //this will hold 0-5 pictures out of the initialUserLikes pictrues
      const secondReviewLikes = db.collection('secondReviewLikes')

      //last photo that the user will get info
      const finalReviewLikes = db.collection('finalReviewLikes')

      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })

      //has to be async so we can get the data from namesCollection
      app.get("/test", (req, res) => {
            // const outputNames = namesCollection.find().toArray()
            // const outputLocations = locationsCollection.find().toArray()
            res.send({ status: 'check!' })
      })

      //this will be called for the first review
      app.post("/firstReview", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location } = req.body

            //runirest api request for travel advisor
            req = unirest("GET", "https://travel-advisor.p.rapidapi.com/locations/search");

            req.query({
                  "query": `${destination} ${location}`,
                  "limit": "30",
                  "offset": "0",
                  "units": "mi",
                  "location_id": "1",
                  "currency": "USD",
                  "sort": "relevance",
                  "lang": "en_US"
            });

            req.headers({
                  "x-rapidapi-key": `${process.env.API_KEY_TRAVEL}`,
                  "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
                  "useQueryString": true
            });

            req.end(function (res) {
                  if (res.error) throw new Error(res.error);

                  //checking api with travel advisor.
                  //looking at things to do for a result type
                  let array = res.body.data

                  let outputArray = []

                  //puts array in the out ouputArray that has things to do, so we filter out lodging and stuff
                  for (let i = 0; i < array.length; i++) {
                        if (array[i].result_type === "things_to_do") {
                              outputArray.push(array[i])
                        }
                  }

                  const picURL = outputArray[0].result_object.photo.images.original.url

                  firstReviewLikes.insertOne({
                        destination: destination,
                        location: location,
                        picture: picURL
                  })
            });
            res.send({ status: 'Submitted' })
      })

      //this will be called for the second review 
      //but adding it to the second review collection
      app.post("/secondReview", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location } = req.body

            //getting api request through node-fetch
            fetch(`${unsplashURL}${destination} ${location}`).then((response) => response.json()).then((picture) => {
                  //namesCollection.insertOne()

                  const picURL = picture.results[0].urls.thumb

                  secondReviewLikes.insertOne({
                        destination: destination,
                        location: location,
                        picture: picURL
                  })
            })
            res.send({ status: 'Submitted' })
      })

      //this will add to the final review
      //only going to be one picture
      app.post("/finalReview", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location } = req.body

            //getting api request through node-fetch
            fetch(`${unsplashURL}${destination} ${location}`).then((response) => response.json()).then((picture) => {
                  //namesCollection.insertOne()

                  const picURL = picture.results[0].urls.thumb

                  finalReviewLikes.insertOne({
                        destination: destination,
                        location: location,
                        picture: picURL
                  })
            })
            res.send({ status: 'Submitted' })
      })

      //deletes an item with a given ID
      app.delete("/test/:id", (req, res) => {

            destinationsCollection.deleteOne({ "_id": ObjectID(req.params.id) })

            res.send({ status: "deleted" })
      })

      //edits an item with a given ID
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