var express = require('express'),
  app = express(),
  routes = require('./routes.js'),
  config = require('./config.json');

app.use(routes.getRoute());

app.listen(config.port, function () {
  console.log('Trend Micro node BE listening on port ' + config.port);
});

routes.initRoutes();
