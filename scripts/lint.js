require('module-alias/register');

const eslint = require('eslint');
const stylelint = require('stylelint');

const { log } = require('../lib/logging');


async function lintJs() {
  log.debug('Lint :: linting js files');

  const cli = new eslint.CLIEngine();
  const { errorCount, warningCount, results } = cli.executeOnFiles(['.']);
  const issueCount = errorCount + warningCount;

  if (issueCount > 0) {
    const formatter = cli.getFormatter();
    log.debug('Lint :: js lint issues:\n', formatter(results));
  }
  else {
    log.debug('Lint :: js lint all clear');
  }
  return issueCount;
}


async function lintSass() {
  log.debug('Lint :: linting sass files');

  const data = await stylelint.lint({
    files: '**/*.scss',
    formatter: 'string',
  });

  const output = data.output && data.output.trim();

  if (output) {
    log.debug('Lint :: sass lint issues:\n\n', output, '\n');
  }
  else {
    log.debug('Lint :: sass lint all clear');
  }

  return !!output;
}


async function lint() {
  let success = true;
  if (await lintSass()) success = false;
  if (await lintJs()) success = false;
  if (success) log.debug('Lint :: files linted with no issues');
  else log.warn('Lint :: file linting failed with errors and/or warnings');
  return success;
}


lint();

