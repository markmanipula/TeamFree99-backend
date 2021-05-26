const unirest = require("unirest");
//password is in a .env file
require('dotenv').config()

function getTravelAdvisorPic(destination, location) {

      return new Promise((resolve, reject) => {
            const travelReq = unirest("GET", "https://travel-advisor.p.rapidapi.com/locations/search");

            travelReq.query({
                  "query": `${destination} ${location}`,
                  "limit": "30",
                  "offset": "0",
                  "units": "mi",
                  "location_id": "1",
                  "currency": "USD",
                  "sort": "relevance",
                  "lang": "en_US"
            });

            travelReq.headers({
                  "x-rapidapi-key": `${process.env.API_KEY_TRAVEL}`,
                  "x-rapidapi-host": "travel-advisor.p.rapidapi.com",
                  "useQueryString": true
            });

            //we ust travelRes so it wont override express' res
            travelReq.end(function (travelRes) {
                  if (travelRes.error) return reject(travelRes.error);

                  //this is an array of data from the API request
                  let array = travelRes.body.data

                  //grabs the first photo of the result
                  let picURL = array[0].result_object.photo.images.original.url

                  const locationId = array[0].result_object.location_id

                  resolve({ picURL, locationId })

            });
      })
}

exports.getTravelAdvisorPic = getTravelAdvisorPic