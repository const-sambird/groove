const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const database = require('../database');
const router = express.Router();
const path = require('path');
const { GENRES, getLatLon, getEvents } = require('../controllers/eventController');

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
        // spotify assigns genres to each artist
        // so we'll just add all of the top artists' genres
        // into one array
        for (let artist of json.items) {
            genres.push(...artist.genres);
        }
        let matchedGenres = [];
        // ticketmaster has very broad genre information
        // 'Pop', 'Rock', 'Country' etc, while spotify has
        // incredibly specific ones (for instance, mine
        // include 'indietronica', 'shiver pop', 'welsh indie')
        // so we figure if there's some overlap between the words
        // it's probably a match, so we'll add it to the array
        for (let ticketmasterGenre of Object.keys(GENRES)) {
            const regex = new RegExp(ticketmasterGenre, 'i');
            genres.forEach(genre => {
                if (regex.test(genre)) matchedGenres.push(GENRES[ticketmasterGenre]);
            })
        }
        getLatLon(req.session.location, coordinates => {
            console.log(req.session)
            if (!coordinates) return res.render('noResults', { reason: 'The provided city didn\'t match one we recognise' });
            getEvents(coordinates[1], coordinates[0], 25, matchedGenres, results => {
                if (!results) return res.render('noResults', { reason: 'There\'s no events we recommend for you in the given city' });
                return res.render('results', { events: results });
            });
        })
    });
});

router.post('/location', (req, res, next) => {
    if (!req.session.user) return res.redirect('/');
    // store the city the user selected in the session info so we can pass it for geocoding later
    req.session.location = req.body.city;
    if (!req.session.user.token || req.session.user.token === 'none') return res.redirect('/doSpotifyLogin');
    res.redirect('/refresh');
});

// this is spotify's auth flow
// i don't like it very much
// but it's based on their guide
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
        let name = req.session.user.name;
        req.session.user = {
            name: name,
            accessToken: json.access_token,
            token: json.refresh_token,
            scope: json.scope,
            tokenExpiry: Date.now() + (json.expires_in * 1000) // seconds to milliseconds
        };
        res.redirect('/doneSpotifyLogin');
    });
});

router.get('/doneSpotifyLogin', (req, res, next) => {
    database.query('UPDATE accounts SET spotifyToken = ? WHERE user = ?', [req.session.user.token, req.session.user.name], (error, results) => {
        if (error) return res.render('error', {message: 'query to update refresh token errored', error: error});
        res.redirect('/');
    })
});

router.get('/refresh', (req, res, next) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', req.session.user.token);
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
        if (json.refresh_token) req.session.user.token = json.refresh_token;
        req.session.user.accessToken = json.access_token;
        req.session.user.tokenExpiry = Date.now() + (json.expires_in * 1000);
        res.redirect('/');
    });
});

module.exports = router;
