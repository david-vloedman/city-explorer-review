'using stric';

const superagent = require('superagent');




// **************************************************************************
// 
//    WEATHER MODEL
// 
// **************************************************************************

function Weather(data) {
  this.forecast = data.summary;
  this.time = new Date(data.time * 1000).toDateString();
  this.created_at = Date.now();
}



const getWeather = (request, response) => {
  const {
    longitude,
    latitude
  } = request.query.data;

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  return requestWeather(url, response);
};

const requestWeather = (url, response) => {
  return superagent.get(url).then(result => {
    const darksky = result.body.daily.data;
    const dailyWeather = darksky.map(day => {
      return new Weather(day);
    });
    response.status(200).send(dailyWeather);
  });
};

module.exports = getWeather;