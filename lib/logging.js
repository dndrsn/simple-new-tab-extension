
const logLevel = require('loglevel');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { isObject, map } = require('lodash');
const fse = require('fs-extra');
const path = require('path');


const config = {
  colors: {
    trace: 'white',
    debug: 'white',
    info: 'cyan',
    warn: 'yellow',
    error: 'red',
  },
  prefix: () => `[${dayjs().format('HH:mm:ss.SSS')}]`,
  logFilesEnabled: false,
  logFileName: () => `${dayjs().format('YYYYMMDD-HHmmss')}.log`,
};


function Logger(id, options = {}) {

  const logger = logLevel.getLogger(id);

  logger.setDefaultLevel(options.logLevel || process.env.LOG_LEVEL || logger.levels.DEBUG);

  let logFd;
  const logToFile = (...args) => {
    if (!logFd) {
      const logFilePath = path.join('.', 'out', config.logFilename());
      fse.ensureFileSync(logFilePath);
      logFd = fse.openSync(logFilePath, 'a');
    }
    fse.appendFileSync(logFd, args.join(' ') + '\n');
  };

  const originalFactory = logger.methodFactory;
  logger.methodFactory = function(methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName),
          color = config.colors[methodName] || 'white';
    return function(...args) {
      const coloredArgs = map(args, arg => {
        if (!isObject(arg)) return chalk[color](arg);
        return arg;
      });
      const coloredPrefix = chalk.grey(config.prefix());
      rawMethod(coloredPrefix, ...coloredArgs);
      if (config.logFilesEnabled) logToFile(...args);
    };
  };

  // call setLevel method in order to apply changes
  logger.setLevel(logger.getLevel());
  return logger;
}

const log = Logger('default');

module.exports = {
  log,
  Logger,
};
