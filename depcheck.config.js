
const { defaultOptions } = require('depcheck/dist/constants');

const scssParser = require('./lib/depcheck/depcheck-scss-parser');
const webpackSpecial = require('./lib/depcheck/depcheck-webpack-special');


module.exports = {
  ignoreMatches: [
    '~',
    '@vshift/common',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
  ],
  ignorePatterns: [
    // @TODO: use gitinore for this
    'pub',
    'dist',
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

