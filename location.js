'using strict';

const superagent = require('superagent');
const pg = require('pg');
//const cache = require('./cacheManager');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Location(data) {
  this.longitude = data.geometry.location.lng;
  this.latitude = data.geometry.location.lat;
  this.formatted_address = data.formatted_address;
}

function getGeocode(request, response) {
  const locationHandler = {
    query: request.query.data,
    cacheHit: results => response.send(results.rows[0]),
    cacheMiss: () => {
      Location.fetchLocation(request.query.data).then(data =>
        response.send(data)
      );
    }
  };
  Location.lookup(locationHandler);
}

Location.fetchLocation = function (query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(result => {
    if (!result.body.results.length) {
      throw 'No data';
    }
    let location = new Location(result.body.results[0]);
    return location.save().then(result => {
      location.id = result.rows[0].id;
      return location;
    });
  });
};



Location.prototype.save = function () {
  const SQL = `INSERT INTO locations(latitude, longitude, formatted_address)
  VALUES($1, $2, $3)
  RETURNING id`;
  const values = Object.values(this);
  return client.query(SQL, values);
};

Location.lookup = handler => {
  const SQL = `SELECT * FROM locations WHERE formatted_address=$1`;
  const values = [handler.query];

  return client
    .query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        handler.cacheHit(results);
      } else {
        handler.cacheMiss();
      }
    })
    .catch(console.error);
};














module.exports = getGeocode;