
const fs = require('fs');
const path = require('path');

const colors = require('ansi-colors');
const depcheck = require('depcheck');
const { each, first, isArray, isEmpty, keys, map } = require('lodash');
const yaml = require('yaml');


// eslint-disable-next-line no-console
const log = { debug: console.log, info: console.info, error: console.error };


const formatDependencies = dependencies => {
  if (!isArray(dependencies)) dependencies = map(dependencies, (filePaths, dependency) => {
    const relFilePaths = map(filePaths, filePath => path.relative(process.cwd(), filePath));
    return `${dependency}: [${relFilePaths.join(', ')}]`;
  });
  return dependencies.join('\n');
};


const checkDependencies = async () => {

  log.debug('Dependencies :: checking dependencies');

  // compatibility w/ cli config processing
  const depcheckConfig = yaml.parse(fs.readFileSync(path.join(process.cwd(), '.depcheckrc.yml'), 'utf8'));
  depcheckConfig.ignoreMatches ??= depcheckConfig.ignores;

  const result = await depcheck(process.cwd(), depcheckConfig);
  if (first(result.dependencies)) {
    log.info('Dependencies :: unused dependencies:\n\n' + formatDependencies(result.dependencies) + '\n');
    log.debug(
      'Dependencies :: remove unused dependencies:',
      colors.cyan(result.dependencies.join(' ')),
      '\n',
    );
  }
  if (first(result.devDependencies)) {
    log.info('Dependencies :: unused dev dependencies:\n\n' + formatDependencies(result.devDependencies) + '\n');
    log.debug(
      'Dependencies :: remove unused dev dependencies:',
      colors.cyan(result.devDependencies.join(' ')),
      '\n',
    );
  }
  if (result.missing && !isEmpty(result.missing)) {
    log.info('Dependencies :: missing dependencies:\n\n' + formatDependencies(result.missing) + '\n');
    log.debug(
      'Dependencies :: add missing dependencies:',
      colors.cyan(keys(result.missing).join(' ')),
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
