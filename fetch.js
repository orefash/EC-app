
const requestPromise = require("request-promise");



module.exports = {
  fetch_loc: function(cb) {    
  const options = {
    uri: "https://chopxpress.com/sandbox/api/fb-bot/list-delivery-locations",
    headers: {
      // "Content-Type": "application/json"
    }
  };
  requestPromise.get(options).then(function(data) {
    var parsedResponse = JSON.parse(data).records;
    // console.log(parsedResponse);
    var elements = {};
    parsedResponse.forEach(function(value) {
      
      // .push({
        elements[value.title] = value.charge;
      // });
      
    });
    
    console.log(elements);
    
    cb(elements);

  });
    
    
  }
  
}