'using strict';

const config = require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');


const PORT = config.PORT || 3000;
const server = express();

server.use(cors());

const client = new pg.Client(config.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));


// **************************************************************************
// 
//    ROUTES
// 
// **************************************************************************










// **************************************************************************
// 
//    START SERVER
// 
// **************************************************************************

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));