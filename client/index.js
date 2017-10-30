var cfg = require('./config');
var applycert = require('./applycert');
console.log('Applying...');
console.log('Please wait...\n');
var i = 0 ;
for (i;i<1000;i++)
    applycert(cfg.accessToken,cfg.seriaNum);