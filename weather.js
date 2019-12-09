'using stric';

const superagent = require('superagent');
const sqlQuery = require('./sqlQuery');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);


// **************************************************************************
// 
//    WEATHER MODEL
// 
// **************************************************************************

function Weather(data, location_id) {
  this.forecast = data.summary;
  this.time = new Date(data.time * 1000).toDateString();
  this.created_at = Date.now();
  this.location_id = location_id;
}

Weather.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('weather', values.length);

};

const getWeather = (request, response) => {
  const {
    longitude,
    latitude,
  } = request.query.data;
  return requestWeatherAPI(latitude, longitude, response);
};

const requestWeatherAPI = (lat, lng, response) => {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`;

  return superagent.get(url).then(result => {
    const darksky = result.body.daily.data;
    const dailyWeather = darksky.map(day => {
      return new Weather(day);
    });
    response.status(200).send(dailyWeather);
  });
};

module.exports = getWeather;