const express = require('express');
const app = require('../app');
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
            return response.render('register', {
                message: 'The email is already in use. Simply log in!'
            });
        }

        database.query('INSERT INTO accounts SET ?', {user: user, password: password}, (error, results) => {
            console.log(results);
            return response.render('location');
        });
    })
});

router.post('/login', function(request, response) {
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
            for(var count = 0; count < results.length; count++)
            {
                if(results[count].password == password)
                {
                    return response.render('location');
                }
                else
                {
                    return response.render('login', {
                        message: 'Incorrect password!'
                    });
                }
            }
        }
        else
        {
            return response.render('login', {
                message: 'Incorrect email, sorry!'
            });
        }
        response.end();
    })
});

module.exports = router;