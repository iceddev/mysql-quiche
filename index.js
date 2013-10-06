var query = require('./lib/query');
var cache = require('./lib/cache');

module.exports = quiche;
function quiche(config){
  var mysqlConfig = config.mysql || {};
  var redisConfig = config.redis || {};

  return function(queryStatement){
    return cache(query(queryStatement, mysqlConfig), redisConfig);
  };
}
