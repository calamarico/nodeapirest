var express = require('express');
var app = express();
var routes = require('./routes.js');
var config = require('./config.json');

app.use(routes.getRoute());

app.listen(config.port, function () {
  console.log('Trend Micro node BE listening on port ' + config.port);
});

routes.initRoutes();
