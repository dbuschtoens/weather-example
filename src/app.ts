import weatherService = require("./weatherService");

weatherService.poll("Karlsruhe").then(function(data) {
  console.log(JSON.stringify(data));
}).catch((error) => {
  console.log(error);
});
