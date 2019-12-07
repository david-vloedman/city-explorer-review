'using strict';

const superagent = require('superagent');


function Restaurant(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
}

const getRestaurant = (request, response) => {
  const location = request.query.data.formatted_query;
  const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const restuarant = result.body.businesses.map(result => new Restaurant(result));
      console.log(restuarant);
    });
};

module.exports = getRestaurant;