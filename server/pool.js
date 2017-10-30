var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'Please input your mysql service link',
    port: 3306,
    database: 'XXXXXX',
    user: 'Input your username',
    password: 'Input your password'
});

module.exports = pool;