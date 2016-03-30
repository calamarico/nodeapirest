var log4js = require('log4js'),
  logger;

log4js.configure({
  appenders: [{
    type: 'console'
  }]
});

logger = log4js.getLogger('dev');
logger.setLevel('INFO');

exports.getLogger = function() {
  return logger;
};

exports.connectLogger = function() {
  return log4js.connectLogger(logger, {level: log4js.levels.INFO});
};
