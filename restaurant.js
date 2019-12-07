'using strict';

const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Restaurant(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
}

Restaurant.prototype.save = function () {
  const SQL = `insert into restarant(rest_name, rating, rest_url, image_url, created_at, location_id) values($1, $2, $3, $4, $5, $6, $7)returning *`;
  const values = Object.values(this);
  return client.query(SQL, values);
};

Restaurant.lookup = handler => {
  const SQL = `select * from restuarants where location_id=$1`;
  const values = [handler.id];

  return client
    .query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        handler.cacheHit(results);
      } else {
        handler.cacheMiss();
      }
    })
};

Restaurant.fetch = function (query) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const restuarant = result.body.businesses.map(result => new Restaurant(result));
      console.log(restuarant);
    });
}


const getRestaurant = (request, response) => {

  const handler = {
    location: request.query.data.formatted_query,
    loc_id: request.query.data.id,
    cacheHit: results => response.send(results),
    cacheMiss: () => {
      Restaurant.fetch(location).then()
    }
  }


};

module.exports = getRestaurant;