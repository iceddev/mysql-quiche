var mysqlConfig = {
  host: 'localhost',
  user: '',
  password: '',
  database: 'test'
};

var quiche = require('../')({
  mysql: mysqlConfig
});

var log = console.log.bind(console);
var error = console.error.bind(console);

var query = quiche('SELECT * FROM something');
query().then(log, error);

var caching = quiche('SELECT * FROM something')
  .cacheAs('something')
  .cacheFor(40);
caching().then(log, error);

var noCache = quiche('SELECT * FROM something')
  .noCache();
noCache().then(log, error);

var guarantee = quiche('SELECT * FROM something LIMIT 1')
  .guarantee(1);
guarantee().then(log, error);

var failGuarantee = quiche('SELECT * FROM something LIMIT 1')
  .guarantee(0);
failGuarantee().then(log, error);

var func = quiche('SELECT * FROM something WHERE id = ?')
  .cacheAs(function(id){
    return 'something_' + id;
  })
  .cacheFor(function(name, id){
    if(id === 1){
      return 100;
    }
    return 1;
  });

func(1).then(log, error);
func(2).then(log, error);

