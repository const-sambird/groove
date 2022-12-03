const fetch = require('node-fetch');

function topArtists(token, callback) {
    fetch('https://api.spotify.com/v1/me/top/artists', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(json => {
        console.log(json.items)
    });
}