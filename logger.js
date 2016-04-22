/**
 * Logger module.
 * @module logger
 */

var log4js = require('log4js'),
  logger;

log4js.configure({
  appenders: [{
    type: 'console'
  }]
});

logger = log4js.getLogger('dev');
logger.setLevel('DEBUG');

/**
 * Returns logger instance.
 */
exports.getLogger = function() {
  return logger;
};

/**
 * Returns log4js middleware function to be used in app.use().
 */
exports.connectLogger = function() {
  return log4js.connectLogger(logger, {level: log4js.levels.INFO});
};
