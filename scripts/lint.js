
const { find } = require('lodash');
const { ESLint } = require('eslint');
const stylelint = require('stylelint');

const { log } = require('../lib/logging');


async function lintJs() {
  log.debug('Lint :: linting js files');

  const eslint = new ESLint();
  const results = await eslint.lintFiles(['.']);
  const hasIssues = !!find(results, result => result.errorCount || result.warningCount);

  if (hasIssues) {
    const formatter = await eslint.loadFormatter('stylish');
    log.debug('Lint :: js lint issues:\n', formatter.format(results));
  }
  else {
    log.debug('Lint :: js lint all clear');
  }
  return hasIssues;
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

