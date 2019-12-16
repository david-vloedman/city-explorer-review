require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

const sqlQuery = (function () {

  const fieldSets = {
    locations: 'longitude, latitude, formatted_query, search_query',
    weather: 'summary, for_date, created_date, location_id',
    restaurant: 'name, rating, price, rest_url, image_url, created_at, location_id'
  };

  const data_experations = {
    weather: () => {
      const exp = new Date();
      exp.setDate(exp.getDate() + 1);
      return exp;
    }

  };

  function SQLselect(table) {
    return `select * from ${table} where location_id=$1`;
  }

  function SQLinsert(table, valueCount) {
    return `insert into ${table} (${fieldSets[table]}) values (${createValueString(valueCount)}) returning *`;
  }

  function createValueString(count) {
    let values = [];
    for (let i = 1; i <= count; i++) {
      values.push(`$${i}`);
    }
    return values.toString();
  }

  function isExpired(date, table) {
    return date <= data_experations[table]();
  }

  return {
    insert: SQLinsert,
    select: SQLselect,
    isExpired: isExpired,
  };
})();

module.exports = sqlQuery;