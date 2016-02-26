var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  routes = require('./routes.js'),
  config = require('./config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false 
}));
app.use(routes.getRoute());

app.listen(config.port, function () {
  console.log('Trend Micro node BE listening on port ' + config.port);
});

routes.initRoutes();
