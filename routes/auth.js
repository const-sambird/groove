const express = require('express');
const database = require('../database');
const router = express.Router();

router.post('/register', function(request, response) {
	//console.log(request.body);
    
    // Capture the input fields
	var user = request.body.user;
	var password = request.body.password;
   

    database.query('SELECT user FROM accounts WHERE user = "${user}" ', (error, results) => {
        if(error)
        {
           throw error;
        }

        if(results.length > 0)
        {
            return response.render('/register', {
                message: 'The username is already in use. Simply log in!'
            });
        }

        database.query('INSERT INTO accounts SET ?', {user: user, password: password}, (error, results) => {
            console.log(results);
            return response.render('location');
        });
    })
});

module.exports = router;