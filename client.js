var https = require('https'),
  soap = require('soap'),
  extend = require('util')._extend,
  config = require('./config.json');

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

/**
 * Performs login post in TrendMicro Rest API.
 * @exports login
 */
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
      userName: socketReq.body.userName,
      password: socketReq.body.password
    }
  }));
  req.end();
};

/**
 * Get Computer Groups using hostGroupRetrieveAll SOAP method.
 * @exports getComputerGroups
 */
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

/**
 * Get Computer Hosts using hostRetrieveAll SOAP method.
 * @exports getComputerHosts
 */
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

/**
 * Get Computer Hosts Detail using hostDetailRetrieveByName SOAP method.
 * @exports getComputerHostsDetail
 */
exports.getComputerHostsDetail = function(socketReq, socketRes) {
  var model = {
    sID: socketReq.query.sID,
    hostname: socketReq.query.hostname,
    hostDetailLevel: 'HIGH'
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostDetailRetrieveByName(model, function(err, result) {
          socketRes.json(result.hostDetailRetrieveByNameReturn);
      });
  });
};
