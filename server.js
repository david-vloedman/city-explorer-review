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
//    ROUTE HANDLERS
// 
// **************************************************************************

const getGeocode = (request, response) => {
  const query = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(result => {
    const location = new LocationGeo(result.body.results[0]);
    response.status(200).send(location);
  }).catch(err => console.error(err));
};

const getWeather = (request, response) => {
  const {
    longitude,
    latitude
  } = request.query.data;

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  return requestWeather(url, response);
};

const requestWeather = (url, response) => {
  return superagent.get(url).then(result => {
    const darksky = result.body.daily.data;
    const dailyWeather = darksky.map(day => {
      return new Weather(day);
    });
    response.status(200).send(dailyWeather);
  });
};

const getRestaurant = (request, response) => {
  const location = request.query.data.formatted_query;
  const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const restuarant = result.body.businesses.map(result => new Restaurant(result));
    });
};

// **************************************************************************
// 
//    ROUTES
// 
// **************************************************************************


server.get('/location', getGeocode);

server.get('/weather', getWeather);

server.get('/yelp', getRestaurant);



// **************************************************************************
// 
//    MODELS
// 
// **************************************************************************

function LocationGeo(data) {
  this.formatted_query = data.formatted_address;
  this.longitude = data.geometry.location.lng;
  this.latitude = data.geometry.location.lat;
}

function Weather(data) {
  this.forecast = data.summary;
  this.time = new Date(data.time * 1000).toDateString();
  this.created_at = Date.now();
}

function Restaurant(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
}

// **************************************************************************
// 
//    START SERVER
// 
// **************************************************************************

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));