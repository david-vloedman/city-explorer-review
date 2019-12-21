'using strict';

const superagent = require('superagent');
const pg = require('pg');
const sqlQuery = require('./sqlQuery');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// **************************************************************************
// 
//    RESTAURANT MODEL
// 
// **************************************************************************

function Restaurant(data, id) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
  this.location_id = id;
}
// **************************************************************************
// 
//    RESTAURANT METHODS
// 
// **************************************************************************

Restaurant.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('restaurant', values.length);
  return client.query(SQL, values);
};

Restaurant.lookup = (handler) => {
  const SQL = `select * from restaurant where location_id=$1`;
  const values = [handler.id];
  return client
    .query(SQL, values)
    .then(results => {
      (results.rowCount > 0) ? handler.cacheHit(results): handler.cacheMiss();
    })
    .catch(error => console.error(error));
};

Restaurant.fetch = (query, id) => {
  const url = `https://api.yelp.com/v3/businesses/search?location=${query}`;

  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const yelp = result.body.businesses;
      const restaurants = yelp.map(result => {
        const restaurant = new Restaurant(result, id);
        restaurant.save();
        return restaurant;
      });
      return restaurants;
    });

};


const getRestaurant = (request, response) => {
  const location = request.query.data.formatted_query;
  const id = request.query.data.id;
  const handler = {
    id: request.query.data.id,
    cacheHit: results => {
      response.send(results.rows);
    },
    cacheMiss: () => {
      Restaurant.fetch(location, id).then(data => response.send(data));
    }
  };
  Restaurant.lookup(handler);

};

module.exports = getRestaurant;