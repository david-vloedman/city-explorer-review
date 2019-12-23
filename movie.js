'using strict';
const sqlQuery = require('./sqlQuery.js');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', error => console.error(error));


// **************************************************************************
// 
//    MOVIE MODEL
// 
// **************************************************************************

function Movie(movie, id) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
  this.created_at = Date.now();
  this.location_id = id;
}

// **************************************************************************
// 
//    MOVIE METHODS
// 
// **************************************************************************

Movie.prototype.save = function () {
  const values = Object.values(this);
  const SQL = sqlQuery.insert('movies', values.length);
  return client.query(SQL, values);
};

Movie.fetch = query => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&include_adult=false&query=${query.data.search_query}`;

  return superagent
    .get(url)
    .then(data => {
      const movies = data.body.results.map(result => {
        const movie = new Movie(result, query.data.id);
        movie.save();
        return movie;
      });
      return movies;
    });
};



Movie.lookup = handler => {
  const values = [handler.location];
  const SQL = sqlQuery.select('movies', values.length);


  return client
    .query(SQL, values)
    .then(results => {
      results.rowCount > 0 ? handler.cacheHit(results) : handler.cacheMiss();
    })
    .catch(console.error);
};

// **************************************************************************
// 
//    GET MOVIE GLOBAL
// 
// **************************************************************************

function getMovies(request, response) {

  const movieHandler = {
    location: request.query.data.id,
    cacheHit: results => {
      response.send(results.rows);
    },
    cacheMiss: () => {
      Movie.fetch(request.query).then(data => {
        response.send(data);
      });
    }
  };
  Movie.lookup(movieHandler);
}

module.exports = getMovies;