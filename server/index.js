var async = require('async');
var AWS = require('aws-sdk');
var config = require('./config');

var crypto = require('crypto');

AWS.config.update({region: 'ap-northeast-2'});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var checkState = "50010";

exports.handle = function(e, ctx, cb) {

  var apiReq = e;
  var serialNum = apiReq.serialNum;
  var accesstoken = apiReq.accesstoken;
  
  async.series({
    varify1:function(done){
      DyCheck(serialNum,accesstoken,function(err,verifyCode){
        done(null,verifyCode);
      });    
    }
  },function(error,results){
    if(checkState=='20020'){
      applycert(serialNum,function(err, certdata){
        cb(null, certdata);
      });  
    }
    else{
      cb(null, { result: 'Apply failed!' });
    }
  })

  //颁发证书
  function applycert(serialNum,callback){
    AWS.config.update({region: config.region});
    var iot = new AWS.Iot();
    var params = {
      setAsActive: true
    };
    //创建证书
    iot.createKeysAndCertificate(params, function(err, certdata) {
      if (err) console.log(err, err.stack); 
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
        console.log("Get cert callback!");
        callback(null,certdata);          // successful response
      }                
    });
  }

  //验证权限
  function sercodeCheck(serialNum,accesstoken,callback){
    var strQue = 'SELECT * FROM product WHERE serialNum='+serialNum +' LIMIT 1'
    console.log(strQue);
    connection.connect();
    connection.query(strQue, function (err, rows, fields) {
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
            checkState = 20020;
            connection.end();
            callback(null,"20020");
          }else{
            checkState = 40030;
            console.log("token不正确")
            //callback("40030");
            return 0;
          }
        }           
      }
    });
  }
}

function DyCheck(serialNum,accesstoken,callback){
  var params = {
    TableName : "cvm",
    ExpressionAttributeValues: {
      ":v1": {
        S: serialNum
       }
     }, 
    KeyConditionExpression: "productid = :v1",
    ProjectionExpression: 'accessToken,productid',
   };

   ddb.query(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Items);
      data.Items.forEach(function(element, index, array) {
        console.log(element.accessToken.S);
      });
      console.log(data.Items[0].accessToken.S);
      var results1 = data.Items[0].accessToken.S;
      if(accesstoken==results1){
        //校验成功
        console.log("AccessToken是"+results1);
        checkState = 20020;
        callback(null,"20020");
      }else{
        checkState = 40030;
        console.log("token不正确")
        //callback("40030");
        return 0;
      }
    }
  });
  
}