const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

const cacheManager = (function () {

  const fieldSets = {
    locations: 'latitude, longitude, formatted_loc',
    weather: 'summary, for_date, created_date, '
  };



  function insert(table) {
    return `insert into ${table} (${fieldSets[table]})`;
  }

  function createValueString(count) {
    let values = [];
    for (let i = 0; i < count; i++) {
      values.push(`$${i}`);
    }
    return values.toString();
  }


  function isCached() {

  }

  function saveToCache(table, data) {
    const values = createValueString(data.length);
    const SQL = `${insert(table)} values (${values}) returning *`;
    console.log(SQL);
    client.query(SQL, data);
  }

  function validateCache() {

  }

  return {
    isCached: isCached,
    save: saveToCache,
    validate: validateCache,
    values: createValueString
  };
})();


const tableName = 'locations';
const fieldData = [12.23441, 45.3224, 'Bend, OR'];
//cacheManager.save(tableName, fieldData);

let query = 'insert into locations (latitude, longitude, formatted_loc) values (12, 45, \'Portland\') returning *';

client.query('select * from locations');