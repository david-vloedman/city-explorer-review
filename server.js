'using strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
//const cors = require('cors');


const PORT = process.env.PORT || 3000;
const server = express();

//server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// **************************************************************************
// 
//    ROUTES
// 
// **************************************************************************

const getGeocode = (request, response) => {
  const query = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(url).then(result => {
    console.log(result.body.results[0].geometry);
  });
};




server.get('/location', getGeocode);



// **************************************************************************
// 
//    ROUTE HANDLERS
// 
// **************************************************************************

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.longitude = data.geometry.longitude;
  this.latitude = data.geometry.latitude;
}

// **************************************************************************
// 
//    START SERVER
// 
// **************************************************************************

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));