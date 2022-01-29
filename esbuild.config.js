
// const { sassPlugin } = require('esbuild-sass-plugin');
// const sassPlugin = require('esbuild-plugin-sass');
const sassPlugin = require('./lib/esbuild/esbuild-plugin-sass');


module.exports = {
  entryPoints: [
    'src/main.scss',
    'src/index.jsx',
    'src/options.jsx',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [
    sassPlugin({
      // cache: true,
      includePaths: ['node_modules'],
      sourceMap: 'out.map',
      sourceMapEmbed: true,
    }),
  ],
};

