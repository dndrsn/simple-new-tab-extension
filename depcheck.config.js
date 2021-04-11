
const { defaultOptions } = require('depcheck/dist/constants');

const scssParser = require('./lib/depcheck/depcheck-scss-parser');
const webpackSpecial = require('./lib/depcheck/depcheck-webpack-special');


module.exports = {
  ignoreMatches: [
    '~',
    '@vshift/common',
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

