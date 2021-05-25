const unirest = require("unirest");
//password is in a .env file
require('dotenv').config()

const req = unirest("GET", "https://travel-advisor.p.rapidapi.com/locations/search");

req.query({
      "query": "Space Needle",
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

      console.log(array)

      let outputArray = []

      for (let i = 0; i < array.length; i++) {
            if (array[i].result_type === "things_to_do") {
                  outputArray.push(array[i])
            }
      }

      //NOTHING!! :(
      console.log(outputArray[0].result_object.photo.images.original.url)
});