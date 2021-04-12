const esbuild = require('esbuild');
const cpx = require('cpx');
const { each } = require('lodash');

const { log } = require('../lib/logging');
const Configuration = require('../lib/configuration');
const esbuildConfig = require('../esbuild.config');
const copyConfig = require('../copy.config');


const compile = async ({ watch } = {}) => {

  const logResult = result => {
    log.debug('Build :: source compiled');
    if (result.warnings?.[0]) log.warn(`Build :: warnings:\n${result.warnings.join('\n')}`);
  };

  const result = await esbuild.build({
    ...esbuildConfig,
    watch: watch && {
      onRebuild(error, result) {
        if (error) log.error('Build :: source compiled with error');
        else logResult(result);
      },
    },
  });
  if (!watch) logResult(result);
};


const copy = async ({ watch } = {}) => {

  if (watch) {
    let isInitialCopy = true;
    const promises = [];
    each(copyConfig.rules, rule => {
      promises.push(new Promise(resolve => {
        const { from, to, options } = rule;
        const watchEvents = cpx.watch(from, to, options);
        watchEvents.on('watch-ready', () => {
          // log.debug('Build :: initial source copied:', from);
          resolve();
        });
        watchEvents.on('copy', e => {
          if (!isInitialCopy) log.debug('Build :: source copied:', e.srcPath);
        });
      }));
    });
    await Promise.all(promises);
    isInitialCopy = false;
    log.debug('Build :: source copied');
  }
  else {
    const promises = [];
    each(copyConfig.rules, rule => {
      promises.push(new Promise(resolve => {
        const { from, to, options } = rule;
        cpx.copy(from, to, options, resolve);
      }));
    });
    await Promise.all(promises);
    log.debug('Build :: source copied');
  }
};


const main = async () => {

  const options = [
    { key: 'watch', type: 'boolean' },
  ];

  const config = new Configuration({ options });

  compile(config);
  copy(config);
};


main();

