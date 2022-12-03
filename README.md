# Groove

Groove is a service that uses Spotify login information to match the user with events they're interested in near them.

This README is intended as a guide to running the project, not a presentation about the project itself.

## Getting credentials

Make a copy of `credentials_example.json` named `credentials.json`. Three credentials will need to be obtained:

* A `client_id` and `client_secret` from a [Spotify application](https://developer.spotify.com/dashboard/applications)
* An API key from [Ticketmaster](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)
* An API key from [Mapbox](https://docs.mapbox.com/api/search/geocoding/)

Fill in the relevant portions of the JSON file.

Note regarding the Spotify application: **the callback URI must be set in the app settings**. Set this value to `http://localhost:5000/callback`.

## Creating a database

Create a MySQL database server and make a new database called `groove`. We then add a table for the account information.

```sql
CREATE DATABASE groove;
USE groove;
CREATE TABLE accounts (user VARCHAR(64) PRIMARY KEY, password VARCHAR(64), spotifyToken VARCHAR(200));
```

## Install & run

Assuming node and npm are installed, Groove can be started with

```
$ npm install
$ npm start
```

The app runs on http://localhost:5000/.
