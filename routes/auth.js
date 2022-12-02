const express = require('express');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
	database: 'database',
    user: 'root',
    email: 'test',
    password: ''
});

const router = express.Router();

router.post('/register', function(request, response) {
	console.log(request.body);
    
    // Capture the input fields
	var user = request.body.username-reg;
	var password = request.body.pwd-reg;
    var email = request.body.email-reg;

    connection.query('SELECT * FROM accounts WHERE email is ?', [email], (error, results) => {
        if(error)
        {
           throw error;
        }

        if(results.length > 0)
        {
            return response.render('/register', {
                message: 'The email is already in use. Simply log in!'
            })
        }

        connection.query('INSERT INTO accounts SET ?', {user: user, email: email, password: password}, (error, results) => {
            if(error)
            {
                throw error;
            }
            else 
            {
                return response.render('/location');
            }
        })
    })
});



module.exports = router;