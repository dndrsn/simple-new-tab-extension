require('module-alias/register');

const depcheck = require('depcheck');
const { defaultOptions } = require('depcheck/dist/constants');
const { each, first, isArray, isEmpty, keys, map } = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const { log } = require('../lib/logging');
const scssParser = require('../lib/depcheck/depcheck-scss-parser');
const webpackSpecial = require('../lib/depcheck/depcheck-webpack-special');


const depcheckOptions = {
  ignoreMatches: [
    '~',
    'core-js',
  ],
  ignorePatterns: [
    // @TODO: use gitinore for this
    'pub',
    'dist',
    'src/config.js',
  ],
  parsers: {
    ...defaultOptions.parsers,
    '**/*.scss': scssParser,
  },
  specials: [
    ...defaultOptions.specials,
    webpackSpecial,
  ],
};

const yarnRemoveCommand = packages => 'yarn remove ' + packages.join(' ');


const yarnAddCommand = packages => 'yarn add ' + keys(packages).join(' ');


// const dump = obj => yaml.dump(obj, { lineWidth: 120 });

const formatDependencies = dependencies => {
  if (!isArray(dependencies)) dependencies = map(dependencies, (filePaths, dependency) => {
    const relFilePaths = map(filePaths, filePath => path.relative(process.cwd(), filePath));
    return `${dependency}: [${relFilePaths.join(', ')}]`;
  });
  return dependencies.join('\n');
};


const checkDependencies = async () => {

  log.debug('Dependencies :: checking dependencies');
  const result = await depcheck(process.cwd(), depcheckOptions);
  if (first(result.dependencies)) {
    log.info('Dependencies :: unused dependencies:\n\n' + formatDependencies(result.dependencies) + '\n');
    log.debug(
      'Dependencies :: to remove unused dependencies:',
      chalk.green(yarnRemoveCommand(result.dependencies)),
      '\n',
    );
  }
  if (first(result.devDependencies)) {
    log.info('Dependencies :: unused dev dependencies:\n\n' + formatDependencies(result.devDependencies) + '\n');
    log.debug(
      'Dependencies :: to remove unused dev dependencies:',
      chalk.green(yarnRemoveCommand(result.devDependencies)),
      '\n',
    );
  }
  if (result.missing && !isEmpty(result.missing)) {
    log.info('Dependencies :: missing dependencies:\n\n' + formatDependencies(result.missing) + '\n');
    log.debug(
      'Dependencies :: to add missing dependencies:',
      chalk.green(yarnAddCommand(result.missing)),
      '\n',
    );
  }
  if (first(result.invalidFiles)) {
    log.warn('Dependencies :: invalid files:', keys(result.invalidFiles));
    const errorDetail = {};
    each(result.invalidFiles, (error, filePath) => {
      errorDetail[filePath] = {
        message: error.message,
        loc: error.loc,
        pos: error.pos,
        stack: error.stack,
      };
    });
    fs.writeFileSync('./depcheck-error.log', `Invalid files:\n${JSON.stringify(errorDetail, null, 2)}`);
    log.warn('Dependencies :: see depcheck-error.log to view invalid file details');
  }
  log.debug('Dependencies :: check complete');
};


checkDependencies();
