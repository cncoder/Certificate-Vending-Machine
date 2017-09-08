var fs = require('fs'),
path = require('path');
var async = require('async');
var cfg = require('./config');

var createcertfile = function(results){
    async.series({
        flag1:function(done){    
            done(null,fsExistsSync('./cert'));        
        }
        },function(error,results){
            console.log(results);
            
            if(results.flag1){
                console.log("not create dir....");
                savecert();
            }
            else{
                fs.mkdirSync('cert', 0755);
                savecert();
            }
        })

    function savecert(){
        //写入证书
        fs.writeFile('./cert/cert.info', results.certificateArn + '\n'+results.certificateId, function (err) {
            if (err) throw err;
            console.log('INFO saved!');
        });
        fs.writeFile('./cert/device-ca.pem', results.certificatePem, function (err) {
            if (err) throw err;
            console.log('Pem saved!');
        });
        fs.writeFile('./cert/public.key', results.keyPair.PublicKey, function (err) {
            if (err) throw err;
            console.log('Pubkey saved! ');
        });
        fs.writeFile('./cert/private.key', results.keyPair.PrivateKey, function (err) {
            if (err) throw err;
            console.log('Private key saved!');
        });
    }
}

//判断文件夹是否存在
function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

module.exports = createcertfile;