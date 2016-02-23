var https = require('https');
var extend = require('util')._extend;
var config = require('./config.json');

var optionsRest = {
	hostname: config.restApiServer,
  port: config.restApiServerPort,
  method: 'POST',
  rejectUnauthorized: false,
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
