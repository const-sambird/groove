const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const router = express.Router();


var database = require('../app');

router.get('/', function(req, res, next) {
    res.render('index', )
})

router.post('/register', function(request, response) {
	// Capture the input fields
	let user = request.body.username-reg;
	let password = request.body.pwd-reg;
    let email = request.body.email-reg;
	// Ensure the input fields exists and are not empty
	if (user && password && email) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		database.query('SELECT username FROM accounts WHERE username = ?', [user], async(error, results) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				return response.render('register', {
					message: 'The email is already registered. Try logging in!'
				})
			} 
			else {

				response.send('Successfully registered!');
			}			
			
			let hashedPassword = await bcrypt.hash(password, 8);

			connection.query('INSERT INTO accounts SET ?', {user: user, email: email, password: hashedPassword}, (error, results) => {
				if (error) {
					console.log(error);
				}
				else {
					return response.render('register', {
						message: 'User registered'
					})
				}
			})

		});
	} else {
		response.send('Please enter Spotify Username, Email and Password!');
		response.end();
	}
});


router.post('/login', function(request, response) {
	// Capture the input fields
	let user = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (user && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE user = "${user}" ', function(error, data) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (data.length > 0) 
			{
				for(var count = 0; count < data.length; count++)
				{
					if(data[count].password == password)
					{
						request.session.user = data[count].user;
					}
					else
					{
						response.send('Incorrect password');
					}
				}
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



const { client_id, client_secret, scopes } = require('../credentials.json').SPOTIFY;

/* GET home page. */
router.get('/', (req, res, next) => {
    if (!req.session.user)
        return res.redirect('/Landing'); // the user isn't logged in
    
    const currentTime = new Date();
    if (currentTime > req.session.user.tokenExpiry)
        return res.redirect('/refresh'); // the access token has expired

    // get the user's top artists
    fetch('https://api.spotify.com/v1/me/top/tracks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.session.user.accessToken
        }
    })
    .then(response => response.json())
    .then(json => {
        for (let item of json.items) {
            let artist = item.artists[0].name;
            for (let i = 1; i < item.artists.length; i++) {
                artist += ", ";
                artist += item.artists[i].name;
            }
            item.artist = artist;
        }
        res.render('index', { tracks: json.items });
    });
});




router.get('/login', (req, res, next) => {
    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', client_id);
    params.append('scope', scopes);
    params.append('redirect_uri', 'http://localhost:3000/callback');
    res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
});

router.get('/callback', (req, res, next) => {
    const code = req.query.code;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'http://localhost:3000/callback');
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(response => response.json())
    .then(json => {
        req.session.user = {
            accessToken: json.access_token,
            refreshToken: json.refresh_token,
            scope: json.scope,
            tokenExpiry: Date.now() + (json.expires_in * 1000) // seconds to milliseconds
        };
        res.redirect('/');
    });
});

router.get('/refresh', (req, res, next) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', req.session.user.refreshToken);
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(response => response.json())
    .then(json => {
        req.session.user.accessToken = json.access_token;
        req.session.user.tokenExpiry = Date.now() + (json.expires_in * 1000);
        res.redirect('/');
    });
});

module.exports = router;
