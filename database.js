const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'groove',
});

connection.connect( (error) => {
    if (error)
    {
        console.log(error);
    } 
});

module.exports = connection;

