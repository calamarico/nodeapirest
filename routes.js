var express = require('express');
var client = require('./client.js');
var router;

exports.initRoutes = function() {
	router.get('/', function (req, res) {
  	res.send('TrendMicro Node API Rest');
	});

	router.get('/login', client.login);
};

exports.getRoute = function() {
	router = router || express.Router();
	return router;
};
