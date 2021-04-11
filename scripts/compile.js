require('module-alias/register');

const webpack = require('webpack');
const chalk = require('chalk');
const { get } = require('lodash');

const { log } = require('../lib/logging');
const webpackIssueFormatter = require('../lib/webpack/webpack-issue-formatter');
const WebpackConfig = require('../config/webpack.config');


function compile(watch = false) {

  const webpackConfig = WebpackConfig();

  log.debug('Compile :: mode:', webpackConfig.mode);

  const compiler = webpack(webpackConfig);

  return new Promise(resolve => {

    const callback = (err, stats) => {

      const errors = get(stats, 'compilation.errors', []),
            warnings = get(stats, 'compilation.warnings', []);

      if (errors.length) {
        log.error('Compile :: compile errors:\n');
        console.log(webpackIssueFormatter(errors)); // eslint-disable-line no-console
      }
      if (warnings.length) {
        log.warn('Compile :: compile warnings:\n');
        console.log(webpackIssueFormatter(warnings)); // eslint-disable-line no-console
      }

      if (err) {
        log.error('Compile :: compile failed:', err);
      }
      else {
        log.debug('Compile :: compiled', chalk.magenta((stats.endTime - stats.startTime) + 'ms'));
      }

      resolve();
    };

    if (watch) {
      log.debug('Compile :: watching');
      compiler.watch({}, callback);
    }
    else {
      log.debug('Compile :: compiling');
      compiler.run(callback);
    }
  });
}


compile();
