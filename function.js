//generates a random 10 digit id
function randomId() {
      let id = ""

      for (let i = 0; i < 10; i++) {
            let num = Math.floor(Math.random() * 10)

            id += num;
      }

      return id;
}


exports.generateID = randomId



