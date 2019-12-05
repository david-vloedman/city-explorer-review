require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

const cacheManager = (function () {

  const fieldSets = {
    locations: 'latitude, longitude, formatted_loc',
    weather: 'summary, for_date, created_date, location_id'
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
    return `insert into ${table} (${fieldSets[table]}) values (${createValueString(valueCount)})`;
  }

  function createValueString(count) {
    let values = [];
    for (let i = 1; i <= count; i++) {
      values.push(`$${i}`);
    }
    return values.toString();
  }

  function saveToCache(table, data) {
    const SQL = SQLinsert(table, data.length);
    client.query(SQL, data);
  }

  function lookup(table, id) {
    const SQL = SQLselect(table);
    const values = [id];
    return client.query(SQL, values);
  }

  return {
    exp: data_experations,
    save: saveToCache,
    lookup: lookup,
  };
})();

module.exports = cacheManager;