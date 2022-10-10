const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const router = express.Router();

const { client_id, client_secret, scopes } = require('../credentials.json').SPOTIFY;

/* GET home page. */
router.get('/', (req, res, next) => {
    if (!req.session.user)
        return res.redirect('/login'); // the user isn't logged in
    
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
        res.render('index', { artists: json.items });
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
