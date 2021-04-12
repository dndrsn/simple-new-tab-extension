const esbuild = require('esbuild');
const cpx = require('cpx');
const { each } = require('lodash');

const { log } = require('../lib/logging');
const Configuration = require('../lib/configuration');
const esbuildConfig = require('../esbuild.config');
const copyConfig = require('../copy.config');


const compile = async ({ watch } = {}) => {
  const result = await esbuild.build({
    ...esbuildConfig,
    watch: watch && {
      onRebuild(error, result) {
        if (error) log.error('Build :: source (re)compiled with error');
        else {
          // @TODO format warnings here
          log.debug('Build :: source (re)compiled:', result);
        }
      },
    },
  });
  // @TODO format warnings here
  if (!watch) log.debug('Build :: source compiled:', result);
};


const copy = async ({ watch } = {}) => {

  if (watch) {
    each(copyConfig.rules, rule => {
      const { from, to, options } = rule;
      const watchEvents = cpx.watch(from, to, options);
      watchEvents.on('watch-ready', () => {
        log.debug('Build :: initial source copied:', from);
      });
      // watchEvents.on('copy', e => {
      //   if (!isFirstCopy) log.debug('Build :: source updated:', e.srcPath);
      // });
    });
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

