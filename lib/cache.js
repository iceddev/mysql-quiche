var redis = require('redis');
var meld = require('meld');
var when = require('when');
var nodefn = require('when/node/function');
var bind = require('lodash.bind');

var uniqueId = require('lodash.uniqueid');

function createCacher(client, query, name, period){
  var cacher = meld.around(query, function(methodCall){
    // keep these locally since altering than can mess with chaining
    var cacheName = name;
    var cachePeriod = period;
    if(typeof cacheName === 'function'){
      cacheName = cacheName.apply(cacheName, methodCall.args);
    }
    if(typeof cachePeriod === 'function'){
      cachePeriod = cachePeriod.apply(cachePeriod, [cacheName].concat(methodCall.args));
    }
    return client.get(cacheName)
      .then(function(data){
        /* jshint eqnull: true */
        data = JSON.parse(data);
        if(data != null){
          return data;
        }
        return methodCall.proceed()
          .then(function(data){
            client.setEx(cacheName, cachePeriod, JSON.stringify(data));
            return data;
          });
      });
  });

  cacher.cacheAs = function(name){
    return createCacher(client, query, name, period);
  };
  cacher.cacheFor = function(period){
    return createCacher(client, query, name, period);
  };
  cacher.noCache = function(){
    return query;
  };
  cacher.guarantee = function(resultsLength){
    return meld.around(query, function(methodCall){
      return methodCall.proceed()
        .then(function(result){
          if(result.length !== resultsLength){
            return when.reject(new Error('Result length not ' + resultsLength));
          }
          return result;
        });
    });
  };
  return cacher;
}

module.exports = cache;
function cache(query, config){
  var redisClient = redis.createClient(config.host, config.port, config);
  var client = {
    get: nodefn.lift(bind(redisClient.get, redisClient)),
    setEx: nodefn.lift(bind(redisClient.setex, redisClient))
  };
  return createCacher(client, query, 'quiche' + uniqueId(), 10);
}
