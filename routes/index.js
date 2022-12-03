const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const database = require('../database');
const router = express.Router();
const path = require('path');

const { client_id, client_secret, scopes } = require('../credentials.json').SPOTIFY;

/* GET home page. */ 
router.get('/', (req, res, next) => {
    if (!req.session.user)
        return res.sendFile(path.join(__dirname + '/../views/landing.html')); // the user isn't logged in
    
    const currentTime = new Date();
    if (currentTime > req.session.user.tokenExpiry)
        return res.redirect('/refresh'); // the access token has expired

    // get the user's top artists
    fetch('https://api.spotify.com/v1/me/top/artists?limit=50', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.session.user.accessToken
        }
    })
    .then(response => response.json())
    .then(json => {
        let genres = []
        for (let artist of json.items) {
            genres.push(...artist.genres);
        }
        console.log(genres);
        res.send(200)
    });
});

router.get('/doSpotifyLogin', (req, res, next) => {
    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', client_id);
    params.append('scope', scopes);
    params.append('redirect_uri', 'http://localhost:5000/callback');
    res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
});

router.get('/callback', (req, res, next) => {
    const code = req.query.code;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'http://localhost:5000/callback');
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
        res.redirect('/doneSpotifyLogin');
    });
});

router.get('/doneSpotifyLogin', (req, res, next) => {
    database.query('UPDATE accounts SET spotifyToken = ? WHERE user = ?', [req.session.user.refreshToken, req.session.user.name], (error, results) => {
        if (error) res.render('error', {message: 'query to update refresh token errored', error: error});
        res.redirect('/');
    })
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
