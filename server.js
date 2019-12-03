'using strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');


const PORT = process.env.PORT || 3000;
const server = express();

server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// **************************************************************************
// 
//    ROUTES
// 
// **************************************************************************

const getGeocode = (request, response) => {
  const query = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(result => {
    const location = new Location(result.body.results[0]);
    response.status(200).send(location);
  }).catch(err => console.error(err));
};

const getWeather = (request, response) => {

  const {
    longitude,
    latitude
  } = request.query.data;

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  return superagent.get(url).then(result => {
    console.log(result.body.daily.data);
    const darksky = result.body.daily.data;
    const dailyWeather = darksky.map(day => {
      return new Weather(day);
    });
    console.log(dailyWeather);

    response.status(200).send(dailyWeather);
  });

};



server.get('/location', getGeocode);

server.get('/weather', getWeather);



// **************************************************************************
// 
//    ROUTE HANDLERS
// 
// **************************************************************************

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.longitude = data.geometry.location.lng;
  this.latitude = data.geometry.location.lat;
}

function Weather(data) {
  this.forecast = data.summary;
  this.time = new Date(data.time * 1000).toDateString();
  this.created_at = Date.now();
}

// **************************************************************************
// 
//    START SERVER
// 
// **************************************************************************

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));