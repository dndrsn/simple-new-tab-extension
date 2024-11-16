
const sassPlugin = require('./lib/esbuild/esbuild-plugin-sass');


module.exports = {
  entryPoints: [
    'src/main.scss',
    'src/index.jsx',
    'src/options.jsx',
    'src/background.js',
    'src/content-script.js',
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
      quietDeps: true,
      silenceDeprecations: ['import', 'legacy-js-api'],
    }),
  ],
};

