var cfg = require('./config');
var createcertfile = require('./createcertfile');

var applycert = function(accesstoken,serialNum){

    var request = require('request');

    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }

    // Configure the request
    var options = {
        url: cfg.apigwlink,
        method: 'POST',
        headers: headers,
        form: {'accesstoken': accesstoken, 'serialNum': serialNum}
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            var results = JSON.parse(body);
            console.log(results.keyPair)
            createcertfile(results);
        }
    })
}

module.exports = applycert;