const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const TICKETMASTER_KEY = require('../credentials.json').TICKETMASTER.KEY;
const MAPBOX_KEY = require('../credentials.json').MAPBOX.KEY;

const TICKETMASTER_GENRES = {
    "Alternative": "KnvZfZ7vAvv",
    "Ballads/Romantic": "KnvZfZ7vAve",
    "Blues": "KnvZfZ7vAvd",
    "Chanson Francaise": "KnvZfZ7vAvA",
    "Children's Music": "KnvZfZ7vAvk",
    "Classical": "KnvZfZ7vAeJ",
    "Country": "KnvZfZ7vAv6",
    "Dance/Electronic": "KnvZfZ7vAvF",
    "Folk": "KnvZfZ7vAva",
    "Hip-Hop/Rap": "KnvZfZ7vAv1",
    "Holiday": "KnvZfZ7vAvJ",
    "Jazz": "KnvZfZ7vAvE",
    "Latin": "KnvZfZ7vAJ6",
    "Medieval/Renaissance": "KnvZfZ7vAvI",
    "Metal": "KnvZfZ7vAvt",
    "New Age": "KnvZfZ7vAvn",
    "Other": "KnvZfZ7vAvl",
    "Pop": "KnvZfZ7vAev",
    "R&B": "KnvZfZ7vAee",
    "Reggae": "KnvZfZ7vAed",
    "Religious": "KnvZfZ7vAe7",
    "Rock": "KnvZfZ7vAeA",
    "Undefined": "KnvZfZ7vAe6",
    "World": "KnvZfZ7vAeF"
}

function getLatLon(location, callback) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${MAPBOX_KEY}&autocomplete=false&types=place&limit=1`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(json => {
        if (!json || json.features.length === 0) return callback(false);
        return callback(json.features[0].center);
    })
}

function getEvents(latitude, longitude, radius, genres, callback) {
    const genreString = !genres ? "" : genres.join();
    fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&latlong=${latitude},${longitude}&radius=${radius}&genreId=${genreString}&classificationName=music`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(json => {
        if (!json || !json._embedded || !json._embedded.events) return callback(false);
        return callback(json._embedded.events);
    })
}

module.exports = {
    GENRES: TICKETMASTER_GENRES,
    getLatLon: getLatLon,
    getEvents: getEvents
};
