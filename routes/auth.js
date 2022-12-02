const express = require('express');
const database = require('../database');
const router = express.Router();

router.post('/register', function(request, response) {
	//console.log(request.body);
    
    // Capture the input fields
	var user = request.body.user;
    var email_add = request.body.email_add;
	var password = request.body.password;
   

    database.query('SELECT email FROM accounts WHERE email = "${email_add}" ', (error, results) => {
        if(error)
        {
           throw error;
        }

        if(results.length > 0)
        {
            return response.render('/register', {
                message: 'The email is already in use. Simply log in!'
            });
        }
    

        database.query('INSERT INTO accounts SET ?', {user: user, email: email_add, password: password}, (error, results) => {
            console.log(results);
            return response.render('/Location');
        });
    })
});

module.exports = router;