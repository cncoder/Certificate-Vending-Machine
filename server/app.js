var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var async = require('async');
var AWS = require('aws-sdk');

var config = require('./config');

var pool = require('./pool.js');
var crypto = require('crypto');

var conCheck = "50010";

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.send('Please do not visit this page!');
});

app.get('/wss', function (req, res) {
  res.send('Hello!');
});

app.post('/', function (req, res) {
  //console.log(req.body);
  var serialNum = req.body.serialNum;
  var accesstoken = req.body.accesstoken;
  async.series({
    flag1:function(done){
      sercodeCheck(serialNum,accesstoken,function(authres){
        console.log(authres);
        done(null,authres);
      });    
    }
  },function(error,results){
    console.log(results);
    console.log(conCheck);
    if(conCheck=='20020'){
      applycert(serialNum,function(certdata){
        res.send(certdata);
      });
      
    }
    else{
      res.send('鉴权失败!');
    }
  })
});

//验证权限
function sercodeCheck(serialNum,accesstoken,callback){
  var strQue = 'SELECT * FROM product WHERE serialNum='+serialNum +' LIMIT 1'
  console.log(strQue);  
  pool.getConnection(function(err, connection) {
      if (err){
          console.log(err.stack);
          console.log("50010");
      }  
      connection.query({
          sql: strQue
      }, function(err, rows, fields) {
          if (err){
              console.log('Error occurs in Tr, ' + err.stack);
          }else{
            //console.log(rows);
             //数据库密码已经是md5的了
             if(rows==""){
              console.log("没有这个序列号")
              //callback("40030");
              return 0;
             }else{
              if(accesstoken==rows[0].accessToken){
                //校验成功
                console.log("AccessToken是"+rows[0].accessToken);
                conCheck = 20020;
                callback("20020");
              }else{
                conCheck = 40030;
                console.log("token不正确")
                //callback("40030");
                return 0;
              }
             }       
              
          }
          connection.release();        
      });
  });
}

//颁发证书
function applycert(serialNum,callback){
  AWS.config.update({region: config.region});
  var iot = new AWS.Iot();
  var params = {
    setAsActive: true || false
  };
  //创建证书
  iot.createKeysAndCertificate(params, function(err, certdata) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
       //为证书附加策略
      var params = {
        policyName: config.policyName, /* required */
        principal: certdata.certificateArn /* required */
      };
     
      iot.attachPrincipalPolicy(params, function(err, policydata) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
          console.log(policydata);           // successful response
          //为证书添加thing
          var params = {
            principal: certdata.certificateArn, /* required */
            thingName: config.policyName /* required */
          };
         
          iot.attachThingPrincipal(params, function(err, thingdata) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(thingdata);           // successful response
          });
          
        }     
      });
      callback(certdata);          // successful response
    }                
  });
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});