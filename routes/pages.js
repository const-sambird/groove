const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	res.render('landing');
});

router.get('/register', (req, res) => {
	res.render('register');
});

router.get('/login', function(req, res) {
	res.render('login');
  });

router.get('/location', function(req, res) {
    res.render('location');
})  

  module.exports = router;