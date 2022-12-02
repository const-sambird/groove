var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  database: 'database',
  user: 'root',
  email: 'test',
  password: ''
});

connection.connect(err => {
  if (err) console.log(err);
});

/* GET users listing.*/ 
router.get('/', function(req, res) {
  res.render('landing');
});


router.post('/register', function(request, response) {
	// Capture the input fields
	let user = request.body.username-reg;
	let password = request.body.pwd-reg;
  let email = request.body.email-reg;
	// Ensure the input fields exists and are not empty
	if (user && password && email) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT username FROM accounts WHERE username = ?', [user], async(error, results) =>{
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

			connection.query('INSERT INTO accounts SET ?', {user: user, email: email, password: password}, (error, results) => {
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

module.exports = router;
