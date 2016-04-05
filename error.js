/**
 * Error module.
 * @module error
 */
var logger = require('./logger.js').getLogger();

function errorConnect(error, request, response, next) {
  logger.error(error);
  response.statusCode = error.statusCode;
  response.send();
}

module.exports = errorConnect;
