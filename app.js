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

const app = express();

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
app.use(express.static(path.join(__dirname, './public')));
app.use('/stylesheets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/javascripts/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/stylesheets/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use(express.static(path.join(__dirname, './views'))); // refactor before release
app.use(session({
    secret: 'secret',
	resave: true,
	saveUninitialized: true
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






	



