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

//require all databases
const { FIRST_TWENTY_heroku_list } = require("./FIRST_TWENY_heroku")
const { finalReviewLikes_heroku_list } = require("./finalReviewLikes_heroku")


//connection string for mongo atlas
const connection_string = `mongodb+srv://admin:${process.env.PW}@cluster0.4v0gp.mongodb.net/${databaseName}?retryWrites=true&w=majority`

//useUnifiedTopology to get rid of the warning
//this is where the CRUD will all happen
MongoClient.connect(`${connection_string}`, { useUnifiedTopology: true }, (err, client) => {
      if (err) return console.error(err)

      const db = client.db(`${databaseName}`)

      //Listen to the port. this has to be first
      app.listen(PORT, () => {
            console.log(`Connected to Database at PORT:${PORT}`);
      })

      //test to check if pictures are in the database
      app.get("/test", (req, res) => {
            res.send(FIRST_TWENTY_heroku_list)
      })

      //displays 20 pictures for the front end
      app.get("/display20", (req, res) => {

            const { id, destination, location } = req.body

            //this is the API syntax for travel advisor
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

                  //this is an array of data from the API request
                  let array = res.body.data

                  //Grabs the first 20 url pictures from the array of data
                  for (let i = 0; i < array.length; i++) {

                        //gives users max of 20 pictures
                        if (i >= 20) break
                        let picURL = array[i].result_object.photo.images.original.url

                        //adding it to local database
                        FIRST_TWENTY_heroku_list.push({
                              id: generateID(),
                              destination: destination,
                              location: location,
                              picture: picURL,
                        })
                  }
            });
            res.send({ status: '20 pictures listed!' })
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

                  //the array of data
                  let array = res.body.data

                  //looking for the location id so we can redirect them to travel advisor recommendation

                  const locationId = array[0].result_object.location_id
                  //only works when state and city are inputted
                  //will route to generic trip advisor attraction otherwise
                  const recommendation = `https://www.tripadvisor.com/Attractions-g${locationId}-Activities-${destination}-${location}`
                  console.log(recommendation)
            });

            res.send({ status: "Recommendation submitted" })
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