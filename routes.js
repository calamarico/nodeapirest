/**
 * Routes module.
 * @module routes
 */

var express = require('express'),
  client = require('./client.js'),
  router = express.Router();

router.get('/', function (req, res) {
  res.send('TrendMicro Node API Rest');
});

router.route('/login')
  .post(client.login)
  .delete(client.logout);
router.get('/computers/groups', client.getComputerGroups);
router.get('/computers/hosts', client.getComputerHosts);
router.get('/computers/hosts/detail', client.getComputerHostsDetail);
router.get('/user', client.getUser);
router.get('/computers/actions/clear', client.clear);
router.get('/computers/actions/deactivate', client.deactivate);
router.get('/computers/actions/recomscan', client.recommendationScan);
router.get('/computers/actions/malwarescan', client.antimalwareScan);
router.get('/computers/actions/integrityscan', client.integrityScan);
router.get('/computers/actions/rebuildbaseline', client.rebuildBaseline);
router.get('/system/events', client.systemEventRetrieve);

module.exports = router;
