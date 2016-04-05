/**
 * Main App.
 * @module app
 */

var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  logger = require('./logger.js'),
  routes = require('./routes.js'),
  errorConnect = require('./error.js'),
  config = require('./config.json');

app.use(logger.connectLogger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false 
}));
app.use(routes);
app.use(errorConnect);

app.listen(config.port, function () {
  logger.getLogger().info('Trend Micro node BE listening on port ' + config.port);
});
