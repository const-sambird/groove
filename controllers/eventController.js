const fetch = require('node-fetch');
const TICKETMASTER_KEY = require('../credentials.json').TICKETMASTER.KEY;
const MAPBOX_KEY = require('../credentials.json').MAPBOX.KEY;

/**
 * This is necessary because Ticketmaster uses genres for music in a different way
 * than Spotify (who also do not do it very intuitively)
 * We will use this enum to build a string to filter by genre when serving final
 * results (see genre_string in getEvents)
 */
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

/**
 * This is the wrapper for the Mapbox API. We have predefined cities set in location.html, and this will
 * be the function that returns an array of co-ordinates representing the location of that city, as the
 * Ticketmaster API requires us to pass a latitude and longitude.
 * 
 * **Note:** the parameter in the callback is structured `[longitude, latitude]`, which is the 'wrong way round';
 * caution must be taken to ensure this is handled properly.
 * 
 * If no location could be resolved, the callback's parameter will be `false`.
 * 
 * @param {String} location 
 * @param {Function|false} callback 
 */
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

/**
 * A wrapper for the Ticketmaster API. Returns an array of events if any were found with the specified genres, or false otherwise.
 * If no genres are provided, we will not filter by genre.
 *
 * @param {String} latitude 
 * @param {String} longitude 
 * @param {Number} radius 
 * @param {String[]} genres 
 * @param {Function|false} callback 
 */
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
