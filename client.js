/**
 * Client module.
 * @module client
 */

var https = require('https'),
  soap = require('soap'),
  extend = require('util')._extend,
  Q = require('q'),
  config = require('./config.json'),
  logger = require('./logger.js').getLogger();

// Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var optionsRest = {
  hostname: config.restApiServer,
  port: config.restApiServerPort,
  headers: {
    'Content-Type': 'application/json'
  }
};

function onRequestError(error) {
  logger.error(error);
}

/**
 * Performs login post in TrendMicro Rest API.
 * @exports login
 */
exports.login = function(socketReq, socketRes) {
  var req = https.request(Object.assign({
    path: '/rest/authentication/login',
    method: 'POST'
  }, optionsRest),
    function(res) {
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        var deferred; 

        if (socketReq.body.tenantName) {
          deferred = Q.defer();
          deferred.promise.then(
            function(result) {
              socketRes.status(res.statusCode);
              socketRes.send({
                sID: chunk,
                tenantSID: result
              });
            },
            onRequestError
          );
          tenantLogin(socketReq.body.tenantName, chunk, deferred);
        } else {
          socketRes.status(res.statusCode);
          socketRes.send({
            sID: chunk
          });
        }
      });
    }
  );

  req.on('error', onRequestError);

  req.write(JSON.stringify({
    dsCredentials: {
      userName: socketReq.body.userName,
      password: socketReq.body.password
    }
  }));
  req.end();
};

function tenantLogin(tenantName, sID, deferred) {
  var req = https.request(Object.assign({
    path: '/rest/authentication/signinastenant/name/' + tenantName + '?sID=' + sID,
    method: 'GET'
  }, optionsRest),
    function(res) {
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        deferred.resolve(chunk);
      });

    }
  );

  req.on('error', onRequestError);
  req.end();
}

/**
 * Performs logout delete in TrendMicro Rest API.
 * @exports logut
 */
exports.logout = function(socketReq, socketRes) {
  var req = https.request(extend(optionsRest, {
    path: '/rest/authentication/logout?sID=' + socketReq.headers.authorization,
    method: 'DELETE'
  }), function(res) {
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        socketRes.status(res.statusCode);
        socketRes.send(chunk);
      });

  });

  req.on('error', onRequestError);
  req.end();
};

/**
 * Get Computer Groups using hostGroupRetrieveAll SOAP method.
 * @exports getComputerGroups
 */
exports.getComputerGroups = function(socketReq, socketRes) {
  var model = {
    sID: socketReq.headers.authorization
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
    sID: socketReq.headers.authorization
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostRetrieveAll(model, function(err, result) {
        socketRes.json(result.hostRetrieveAllReturn);
      });
  });
};

/**
 * Get Hosts Status using hostGetStatus SOAP method.
 * @exports _getHostStatus
 */
function _getHostStatus(sID, id, deferred) {
  var model = {
    sID: sID,
    id: id
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostGetStatus(model, function(err, result) {
        deferred.resolve(result);
      });
  });
}

/**
 * Get Computer Hosts Detail using hostDetailRetrieveByName SOAP method.
 * @exports getComputerHostsDetail
 */
exports.getComputerHostsDetail = function(socketReq, socketRes) {
  var deferred = Q.defer(),
    model = {
      sID: socketReq.headers.authorization,
      hostDetailLevel: 'HIGH',
      hostFilter: {
        hostID: socketReq.query.hostID,
        hostGroupID: 0,
        securityProfileID: 0,
        type: 'SPECIFIC_HOST'
      }
    };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostDetailRetrieve(model, function(err, result) {
        _getHostStatus(model.sID, socketReq.query.hostID, deferred);
        deferred.promise.then(function(_result) {
          socketRes.json([extend(
            result.hostDetailRetrieveReturn[0], _result.hostGetStatusReturn)]);
        });
      });
  });
};
