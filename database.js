const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
	database: 'database',
    user: 'root',
    email: 'test',
    password: ''
});

connection.connect( (error) => {
    if (error)
    {
        console.log(error);
    } 
});

module.exports = connection;

