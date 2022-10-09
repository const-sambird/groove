const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const { host, user, password, database } = require('../credentials.json').DATABASE;

const app = express();
const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

connection.connect(err => {
    if (err) console.log(err);
});

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
        
});

app.listen(PORT, () => console.log('listening on ' + PORT));
