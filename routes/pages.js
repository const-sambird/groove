const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/../views/landing.html'));
});

router.get('/register', (req, res) => {
	res.sendFile(path.join(__dirname + '/../views/register.html'));
});

router.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname + '/../views/login.html'));
  });

router.get('/location', function(req, res) {
  res.sendFile(path.join(__dirname + '/../views/location.html'));
})  

  module.exports = router;