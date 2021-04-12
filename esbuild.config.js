
const { sassPlugin } = require('esbuild-sass-plugin');


module.exports = {
  entryPoints: [
    'src/main.jsx',
    'src/main.scss',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [
    sassPlugin({
      cache: true,
      includePaths: ['node_modules'],
    }),
  ],
};

