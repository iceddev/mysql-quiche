var mysql = require('mysql');
var when = require('when');
var nodefn = require('when/node/function');
var bind = require('lodash.bind');

function createConnection(config){
  var connection = mysql.createConnection(config);

  return {
    connect: nodefn.lift(bind(connection.connect, connection)),
    query: nodefn.lift(bind(connection.query, connection)),
    end: nodefn.lift(bind(connection.end, connection))
  };
}

module.exports = query;
function query(queryStatement, config){
  return function execute(){
    var defer = when.defer();
    var args = Array.prototype.slice.call(arguments, 0);
    var connection = createConnection(config);

    connection.connect()
      .then(function(){
        return connection.query(queryStatement, args);
      })
      .then(function(data){
        var rows;
        var meta;
        if(data[1]){
          rows = data[0];
          meta = data[1];
        } else {
          meta = data[0];
        }
        defer.resolve(rows || meta);
      })
      .then(function(){
        return connection.end();
      });

    return defer.promise;
  };
}
