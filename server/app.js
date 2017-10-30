var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var async = require('async');
var AWS = require('aws-sdk');
var config = require('./config');
var pool = require('./pool.js');

/**
 * respond content init
 * confrim Check state
 * verify : 20020
 * applied：40010
 * AccessDeny： 40030
 * invalid accessToken: 40090
 * Service error: 50010
 */
var content = {};
content.rootCA = config.rootCA;
content.conCheck = "50010"; // init CheckState
var deviceInfo = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function (req, res) {

  if (!!!req.body.seriaNum) res.send('Invalid requset!');
  var seriaNum = req.body.seriaNum; //Device seriaNumber
  var accessToken = req.body.accessToken; //Device Token
  deviceInfo.seriaNum = seriaNum;

  async.series([
    function (cb) { sercodeCheck(seriaNum, accessToken, cb) }
  ], function (err, results) {
    console.log('1.1 err: ', err);
    console.log('1.1 results: ', results[0]);
    content.conCheck = results[0];
    if (content.conCheck == '20020') {
      applycert(seriaNum, function (certdata) {
        content.certdata = certdata;
        res.send(content);
      });
    }
    else {
      console.log("content.conCheck =>>>>" + content.conCheck);
      res.send(content);
    }
  });
});

/**
 * Verify permissions
 * @param {number} seriaNum
 * @param {string} accessToken
 */
function sercodeCheck(seriaNum, accessToken, callback) {
  var strQue = 'SELECT * FROM product WHERE seriaNum=' + seriaNum + ' LIMIT 1'
  console.log(strQue);
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err.stack);
      //SQL service error
      content.conCheck = 50010;
      return;
    }
    connection.query({
      sql: strQue
    }, function (err, rows, fields) {
      if (err) {
        console.log('Error occurs in Tr, ' + err.stack);
        content.conCheck = 40030;
        return;
      } else {
        if (rows == "") {
          console.log("Can not find the product information!")
          content.conCheck = 40030;
          return;
        } else {
          console.log(rows[0])
          console.log("==>>>>>>>>>>" + rows[0].applyState)
          if (rows[0].applyState == 1 && accessToken == rows[0].accessToken) {
            deviceInfo.thingName = rows[0].thingName;
            deviceInfo.policyName = rows[0].policyName;
            callback(null,"20020");
          } else {
            content.conCheck = 40030;
            console.log("Invalid token");
            connection.release();
            return;
          }
        }
      }
      connection.release();
    });
  });
}

/**
 * Apply for a certificate
 * @param {number} groupNum Subgroup id to query.
 * @param {string|number|null} term An itemName,
 *     or itemId, or null to search everything.
 */
function applycert(seriaNum, callback) {
  AWS.config.update({ region: config.region });
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true || false
  };
  //Create device Certificate info
  iot.createKeysAndCertificate(params, function (err, certdata) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      //attach Policy
      var params = {
        policyName: deviceInfo.policyName, /* required */
        principal: certdata.certificateArn /* required */
      };

      iot.attachPrincipalPolicy(params, function (err, policydata) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          console.log(policydata);           // successful response
          //attach thingName
          var params = {
            principal: certdata.certificateArn, /* required */
            thingName: deviceInfo.thingName /* required */
          };

          iot.attachThingPrincipal(params, function (err, thingdata) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(thingdata);           // successful response
          });
        }
      });
      callback(certdata);          // successful response
    }
  });
}

app.get('/', function (req, res) {
  res.send('Access Deny!');
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

app.listen(3000, function () {
  console.log('CVM app listening on port 3000!');
});