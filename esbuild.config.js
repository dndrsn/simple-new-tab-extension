
const sassPlugin = require('esbuild-plugin-sass');


module.exports = {
  entryPoints: [
    'src/background.js',
    'src/main.js',
    'src/main.scss',
  ],
  bundle: true,
  sourcemap: 'inline',
  outdir: 'pub',
  plugins: [
    sassPlugin(),
  ],
};
