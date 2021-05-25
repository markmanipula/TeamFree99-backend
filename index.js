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

//for generating id for heroku
const { generateID } = require("./function")

//require all three databases
const { FIRST_TWENTY_heroku_list } = require("./FIRST_TWENY_heroku")
const { firstReviewLikes_heroku_list } = require("./firstReviewLikes_heroku")
const { secondReviewLikes_heroku_list } = require("./secondReviewLikes_heroku")
const { finalReviewLikes_heroku_list } = require("./firstReviewLikes_heroku")


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


      const FIRST_TWENTY = db.collection('FIRST_TWENTY')

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
            res.send(FIRST_TWENTY_heroku_list)
      })

      //displays 20 pictures for the front end
      app.get("/display20", (req, res) => {

            const { destination, location } = req.body

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

                  //let outputArray = []

                  //puts array in the out ouputArray that has things to do, so we filter out lodging and stuff
                  for (let i = 0; i < array.length; i++) {

                        //gives users max of 20 pictures
                        if (i >= 20) break
                        // if (array[i].result_type === "things_to_do") {
                        //       outputArray.push(array[i])
                        // }

                        let picURL = array[i].result_object.photo.images.original.url

                        FIRST_TWENTY.insertOne({
                              destination: destination,
                              location: location,
                              picture: picURL,
                              //gives a value of like/dislike depending on the user
                              //but how?
                              status: "like"
                        })

                        //adding it to local database
                        FIRST_TWENTY_heroku_list.push({
                              destination: destination,
                              location: location,
                              picture: picURL,
                              //gives a value of like/dislike depending on the user
                              //but how?
                              status: "like"
                        })
                  }
            });
            res.send({ status: 'Submitted' })
      })

      //this will be called for the first review
      app.post("/firstReview", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location, status } = req.body

            //firstReviewLikes collection
            //if user like a photo, itll add to the first reviewlikes collection
            firstReviewLikes.insertOne({
                  destination: destination,
                  location: location,
                  //how do i get the initial picture from the first collection
                  picture: "",
                  //gives a value of like/dislike depending on the user
                  //but how?
                  status: "like"
            })

            res.send({ status: 'Submitted' })
      })

      //this will be called for the second review 
      //but adding it to the second review collection
      app.post("/secondReview", (req, res) => {

            //namesCollection.insertOne(req.body)
            const { destination, location, status } = req.body

            //if user select from the second review likes, itll add to this collection
            secondReviewLikes.insertOne({
                  destination: destination,
                  location: location,
                  //how do i get the initial picture from the first collection
                  picture: "",
                  //gives a value of like/dislike depending on the user
                  //but how?
                  status: "like"
            })
            res.send({ status: 'Submitted' })
      })

      //this will add to the final review
      //only going to be one picture
      app.post("/finalReview", (req, res) => {

            const { destination, location } = req.body

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

                  //let outputArray = []
            });

            res.send({ status: 'Submitted' })
      })

      //deletes an item with a given ID
      app.delete("/test/:id", (req, res) => {

            destinationsCollection.deleteOne({ "_id": ObjectID(req.params.id) })

            res.send({ status: "deleted" })
      })

      //edits an item with a given ID
      //probably not needed
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