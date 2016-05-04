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

function logClientRestRequest(response) {
  logger.debug('Internal REST request: ' +
      response.req.method + ' ' +
      optionsRest.hostname + ':' +
      optionsRest.port + '/' +
      response.req.path +
      ' StatusCode:' + response.statusCode);
}

function logClientSoapRequest(result) {
  var method = Object.keys(result)[0].split('Return')[0];
  logger.debug('Internal SOAP request: ' +
      method + ' SUCCESS');
}

/**
 * Performs login post in TrendMicro Rest API.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.login = function(socketReq, socketRes, next) {
  var req = https.request(Object.assign({
    path: '/rest/authentication/login',
    method: 'POST'
  }, optionsRest),
    function(res) {
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        var deferred;

        logClientRestRequest(res);

        if (res.statusCode !== 200) {
          return next({
            statusCode: res.statusCode
          });
        }

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

/**
 * Performs get to siginastenant resource to get tenantsessionid.
 * @param {String} tenantName - Name of tenant to login.
 * @param {String} sID - User session id.
 * @param {Object} deferred - Q deferred object.
 */
function tenantLogin(tenantName, sID, deferred) {
  var req = https.request(Object.assign({
    path: '/rest/authentication/signinastenant/name/' + tenantName + '?sID=' + sID,
    method: 'GET'
  }, optionsRest),
    function(res) {
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        logClientRestRequest(res);
        deferred.resolve(chunk);
      });

    }
  );

  req.on('error', onRequestError);
  req.end();
}

/**
 * Performs logout delete in TrendMicro Rest API.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.logout = function(socketReq, socketRes) {
  var req = https.request(Object.assign({
      path: '/rest/authentication/logout?sID=' + socketReq.headers.authorization,
      method: 'DELETE'
    }, optionsRest),
    function(res) {
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        logClientRestRequest(res);
        socketRes.status(res.statusCode);
        socketRes.send(chunk);
      });

  });

  req.on('error', onRequestError);
  req.end();
};

/**
 * Get Computer Groups using hostGroupRetrieveAll SOAP method.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.getComputerGroups = function(socketReq, socketRes, next) {
  var model = {
    sID: socketReq.headers.authorization
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostGroupRetrieveAll(model, function(err, result) {
        if (err) {
          return next({
            statusCode: (err && err.response) ? 
              err.response.statusCode :
              503
          });
        }

        result && logClientSoapRequest(result);
        socketRes.json(result ?
          result.hostGroupRetrieveAllReturn :
          []);
      });
  });
};

/**
 * Get Computer Hosts using hostRetrieveAll SOAP method.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.getComputerHosts = function(socketReq, socketRes, next) {
  var model = {
    sID: socketReq.headers.authorization
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostRetrieveAll(model, function(err, result) {
        if (err) {
          return next({
            statusCode: (err && err.response) ? 
              err.response.statusCode :
              503
          });
        }

        result && logClientSoapRequest(result);
        socketRes.json(result ?
          result.hostRetrieveAllReturn :
          []);
      });
  });
};

/**
 * Get Hosts Status using hostGetStatus SOAP method.
 * @param {String} sID - Session id.
 * @param {Number} id - Host id.
 * @param {Object} deferred - Q deferred object.
 */
function _getHostStatus(sID, id, deferred) {
  var model = {
    sID: sID,
    id: id
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostGetStatus(model, function(err, result) {
        result && logClientSoapRequest(result);
        deferred.resolve(result);
      });
  });
}

/**
 * Get Computer Hosts Detail using hostDetailRetrieveByName SOAP method.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.getComputerHostsDetail = function(socketReq, socketRes, next) {
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
        if (err) {
          return next({
            statusCode: (err && err.response) ? 
              err.response.statusCode :
              503
          });
        }

        result && logClientSoapRequest(result);
        _getHostStatus(model.sID, socketReq.query.hostID, deferred);
        deferred.promise.then(function(_result) {
          socketRes.json([extend(
            result.hostDetailRetrieveReturn[0], _result.hostGetStatusReturn)]);
        });
      });
  });
};

/**
 * Get User details.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.getUser = function(socketReq, socketRes, next) {
  var model = {
    sID: socketReq.headers.authorization,
    name: socketReq.query.name
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.userRetrieveByName(model, function(err, result) {
        if (err) {
          return next({
            statusCode: (err && err.response) ? 
              err.response.statusCode :
              503
          });
        }

        result && logClientSoapRequest(result);
        socketRes.json(result ?
          result.userRetrieveByNameReturn :
          {});
      });
  });
};

/**
 * Clear Warnings/Errors in host.
 * @param {Object} socketReq - Socket Request.
 * @param {Object} socketRes - Socket Response.
 */
exports.clear = function(socketReq, socketRes, next) {
  var model = {
    sID: socketReq.headers.authorization,
    hostIDs: socketReq.query.id
  };

  soap.createClient(config.soapApiServer, function(err, client) {
      client.hostClearWarningsErrors(model, function(err, result) {
        if (err) {
          return next({
            statusCode: (err && err.response) ? 
              err.response.statusCode :
              503
          });
        }

        result && logClientSoapRequest(result);
        socketRes.json(result ?
          result.hostClearWarningsErrors :
          {});
      });
  });
};
