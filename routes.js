/**
 * Routes module.
 * @module routes
 */

var express = require('express'),
  client = require('./client.js'),
  router;

/**
 * Initializes Routes.
 */
exports.initRoutes = function() {
  router.get('/', function (req, res) {
    res.send('TrendMicro Node API Rest');
  });

  router.route('/login')
    .post(client.login)
    .delete(client.logout);
  router.get('/computers/groups', client.getComputerGroups);
  router.get('/computers/hosts', client.getComputerHosts);
  router.get('/computers/hosts/detail', client.getComputerHostsDetail);
};

/**
 * Creates and returns express router.
 */
exports.getRoute = function() {
  router = router || express.Router();
  return router;
};
