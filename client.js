var https = require('https');
var soap = require('soap');
var extend = require('util')._extend;
var config = require('./config.json');

// Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var optionsRest = {
	hostname: config.restApiServer,
  port: config.restApiServerPort,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

function onRequestError(error) {
	console.log(error);
}

function logClientRequest(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
}

exports.login = function(socketReq, socketRes) {
	var req = https.request(extend(optionsRest, {
		path: '/rest/authentication/login'
	}), function(res) {
			logClientRequest(res);
	  	res.setEncoding('utf8');
	  	
	  	res.on('data', function (chunk) {
	    	console.log('BODY: ' + chunk);
	    	socketRes.status(res.statusCode);
	    	socketRes.send(chunk);
  		});

	});

	req.on('error', onRequestError);

	req.write(JSON.stringify({
		dsCredentials: {
			userName: socketReq.query.userName,
			password: socketReq.query.password
		}
	}));
	req.end();
};

exports.getComputerGroups = function(socketReq, socketRes) {
	var model = {
		sID: socketReq.query.sID
	};

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostGroupRetrieveAll(model, function(err, result) {
          socketRes.json(result.hostGroupRetrieveAllReturn);
      });
  });
};

exports.getComputerHosts = function(socketReq, socketRes) {
	var model = {
		sID: socketReq.query.sID
	};

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostRetrieveAll(model, function(err, result) {
          socketRes.json(result.hostRetrieveAllReturn);
      });
  });
};
