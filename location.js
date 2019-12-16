'using strict';

const superagent = require('superagent');
const pg = require('pg');
const sqlQuery = require('./sqlQuery');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Location(data, query) {
  this.longitude = data.geometry.location.lng;
  this.latitude = data.geometry.location.lat;
  this.formatted_query = data.formatted_address;
  this.search_query = query;
}

function getGeocode(request, response) {
  const handler = {
    query: request.query.data,
    cacheHit: results => response.send(results),
    cacheMiss: () => {
      Location.fetchLocation(request.query.data).then(data =>

        response.send(data)
      );
    }
  };
  Location.lookup(handler);
}

Location.fetchLocation = function (query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(result => {
    if (!result.body.results.length) throw 'No data';

    const location = new Location(result.body.results[0], query);
    return location.save().then(result => {
      location.id = result.rows[0].id;

      return location;
    });
  });
};



Location.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('locations', values.length);
  return client.query(SQL, values);
};

Location.lookup = handler => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const values = [handler.query];
  return client
    .query(SQL, values)
    .then(results => results.rowCount > 0 ? handler.cacheHit(results.rows[0]) : handler.cacheMiss())
    .catch(console.error);
};














module.exports = getGeocode;