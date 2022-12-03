const express = require('express');
const app = require('../app');
const path = require('path');
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
            return response.sendFile('/../views/register.html');
        }

        database.query('INSERT INTO accounts SET ?', {user: user, password: password, spotifyToken: ""}, (error, results) => {
            console.log(results);
            request.session.user = {
                name: user
            };
            return response.sendFile('/../views/location.html');
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
                    request.session.user = {
                        name: user
                    }
                    return response.sendFile('/../views/location.html');
                }
                else
                {
                    return response.sendFile('/../views/login.html');
                }
            }
        }
        else
        {
            return response.sendFile('/../views/login.html');
        }
        response.end();
    })
});

module.exports = router;