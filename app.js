const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const { host, user, password, database } = require('./credentials.json').DATABASE;
const index = require('./routes/index');
const users = require('./routes/users');
const { builtinModules } = require('module');

const app = express();

app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/Landing.html'));
});

// we're going to need this later but i'll disable it for now

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

module.exports = connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stylesheets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/javascripts/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/stylesheets/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use(session({
    secret: 'secret'
}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;




app.post('/register', function(request, response) {
	// Capture the input fields
	let user = request.body.username-reg;
	let password = request.body.pwd-reg;
    let email = request.body.email-reg;
	// Ensure the input fields exists and are not empty
	if (user && password && email) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT username FROM accounts WHERE username = ?', [user], async(error, results) {
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


app.post('/login', function(request, response) {
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


	



