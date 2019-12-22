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
}

// **************************************************************************
// 
//    TRAIL METHODS
// 
// **************************************************************************