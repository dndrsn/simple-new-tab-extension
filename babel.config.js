
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3',
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
    }],
  ],
  plugins: [
    ['babel-plugin-root-import', {
      rootPathPrefix: '~',
      rootPathSuffix: './src',
    }],
    ['./lib/babel/babel-plugin-wildcard.js', { 'exts': ['js', 'jsx', 'json', 'yml', 'yaml', 'csv'] }],
    '@babel/plugin-proposal-optional-chaining',
  ],
  sourceMaps: true,
};

