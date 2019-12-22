'using strict';
const sqlQuery = require('./sqlQuery.js');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', error => console.error(error));

// **************************************************************************
// 
//    TRAIL MODEL
// 
// **************************************************************************

function Trail(data) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.star_votes;
  this.summary = data.summary;
  this.trail_url = data.trail_url;
  this.conditions = data.conditions;
  this.condition_date = data.condition_date;
  this.condition_time = data.condition_time;
  this.created = Date.now();
  this.location_id = id;
}

// **************************************************************************
// 
//    TRAIL METHODS
// 
// **************************************************************************

Trail.fetch = query => {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${query.latitude}&lon=${query.longitude}&key=${process.env.TRAIL_KEY}`;
  console.log('fetching trail', url);
  return superagent
    .get(url)
    .then(result => {
      const trailData = result.body.trails.map(data => {
        const trailSummary = new Trail(data, query.id);
        trailSummary.save()
        return trailSummary;
      })
      return trailData;
    })
}

Trail.lookup = handler => {
  const SQL = `SELECT * FROM trail WHERE location_id=$1`;
  const values = [handler.location];

  return client
    .query(SQL, values)
    .then(results => {
      results.rowCount > 0 ? handler.cacheHit(results) : handler.cacheMiss();
    })
    .catch(console.error);
};

// **************************************************************************
// 
//    GET TRAIL GLOBAL
// 
// **************************************************************************


function getTrails(request, response) {

  const handler = {
    location: request.query.data.id,
    cacheHit: results => {
      response.send(results.rows);
    },
    cacheMiss: () => {
      console.log(request.query);
      Trail.fetch(request.query.data).then(data => response.send(data));
    }
  };
  Trail.lookup(handler);
}

module.exports = getTrails;