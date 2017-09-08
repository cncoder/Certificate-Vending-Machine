var cfg = require('./config');
var applycert = require('./applycert');
console.log('Applying...');
console.log('Please wait...\n');
applycert(cfg.accesstoken,cfg.serialNum);