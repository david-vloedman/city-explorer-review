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

function Trail(data, id) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionStatus;
  this.parseDateTime(data.conditionDate);

  this.created_at = Date.now();
  this.location_id = id;
}

Trail.prototype.parseDateTime = function (dtstring) {
  const splitDt = dtstring.split(' ');
  this.condition_date = splitDt[0];
  this.condition_time = splitDt[1];

}
// **************************************************************************
// 
//    TRAIL METHODS
// 
// **************************************************************************

Trail.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('trail', values.length);
  return client.query(SQL, values);
}



Trail.fetch = query => {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${query.latitude}&lon=${query.longitude}&key=${process.env.TRAIL_KEY}`;

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
    cacheHit: results => response.send(results.rows),
    cacheMiss: () => Trail.fetch(request.query.data).then(data => response.send(data))
  };
  Trail.lookup(handler);
}

module.exports = getTrails;