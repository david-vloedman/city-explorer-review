'using stric';

const superagent = require('superagent');
const sqlQuery = require('./sqlQuery');
const validateCache = require('./validateCache');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

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

// **************************************************************************
// 
//    WEATHER METHODS
// 
// **************************************************************************

Weather.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('weather', values.length);
  return client.query(SQL, values);
};

Weather.fetch = (lat, lng, id) => {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`;

  return superagent.get(url)
    .then(result => {
      const darksky = result.body.daily.data;
      const dailyWeather = darksky.map(day => {
        const weather = new Weather(day, id);
        weather.save();
        return weather;
      });

      return dailyWeather;
    })
    .catch(error => console.error(error));
};


Weather.lookup = (handler, id) => {

  const SQL = sqlQuery.select('weather');
  const values = [id];
  return client
    .query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        const created = results.rows[0].created_at;
        if (validateCache.isExpired(created, 'weather')) {
          const id =
            client.query()
        } else {
          handler.cacheHit(results.rows);
        }

      } else {
        handler.cacheMiss();
      }

    })
    .catch(error => console.error(error));
};

// **************************************************************************
// 
//    GET WEATHER GLOBAL
// 
// **************************************************************************


const getWeather = (request, response) => {
  const {
    id,
    longitude,
    latitude,
  } = request.query.data;

  const handler = {
    cacheHit: results => {
      response.send(results);
    },
    cacheMiss: () => {
      Weather.fetch(latitude, longitude, id)
        .then(data => {
          response.send(data);
        });
    }
  };

  Weather.lookup(handler, id);
};

module.exports = getWeather;