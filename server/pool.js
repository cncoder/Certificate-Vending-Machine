var mysql = require('mysql');

var pool = mysql.createPool({
    host: '423423',
    port: 3306,
    database: 'rwe',
    user: 'rwe',
    password: '432423'
});

module.exports = pool;