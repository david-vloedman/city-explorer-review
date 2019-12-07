'using strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

const getWeather = require('./weather.js');
const getLocation = require('./location.js');
const getRestaurant = require('./restaurant.js');


const PORT = process.env.PORT || 3000;
const server = express();

server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// **************************************************************************
// 
//    ROUTE HANDLERS
// 
// **************************************************************************
function notFoundHandler(request, response) {
  response.status(404).send('This page cannot be found');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}


// **************************************************************************
// 
//    ROUTES
// 
// **************************************************************************


server.get('/location', getLocation);

server.get('/weather', getWeather);

server.get('/yelp', getRestaurant);

server.use('*', notFoundHandler);


// **************************************************************************
// 
//    START SERVER
// 
// **************************************************************************

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));