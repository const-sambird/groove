const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const pages = require('./routes/pages');
const index = require('./routes/index');
const auth = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// using the bootstrap css and also the addin to maintain session state
// (which is where we will hold user information while we're working)
// it will persist in the database however
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/stylesheets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/javascripts/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/stylesheets/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use(session({
    secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// using pages to serve the static files and index to render the result
app.use('/', index);
app.use('/', pages);
app.use('/auth', auth);

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

app.listen(5000, () => {
	console.log("Server started on port 5000");
})

module.exports = app;
