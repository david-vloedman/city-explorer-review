'using strict';

const validateCache = (function () {

  const expirations = {
    weather: () => {
      const exp = new Date();
      exp.setDate(exp.getDate() + 1);
      return new Date(exp).toDateString();
    },
    restaurant: () => {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      return exp;
    },
    movies: () => {
      const exp = new Date();
      exp.setDate(exp.getDate() + 7);
    },
    trail: () => {
      const exp = new Date();
      exp.setDate(exp.getDate() + 1);
    }
  };

  function isExpired(date, table) {

    return date >= Date.parse(expirations[table]());
  }
  return {
    isExpired: isExpired
  };

})();

module.exports = validateCache;