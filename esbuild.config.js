
// const { sassPlugin } = require('esbuild-sass-plugin');
// const sassPlugin = require('esbuild-plugin-sass');
const sassPlugin = require('./lib/esbuild/esbuild-plugin-sass');


module.exports = {
  entryPoints: [
    'src/main.jsx',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [
    sassPlugin({
      // cache: false,
      includePaths: ['node_modules'],
      sourceMap: true,
      sourceMapEmbed: true,
    }),
  ],
};

