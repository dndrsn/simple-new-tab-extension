
const path = require('path');

const sass = require('sass');


module.exports = options => {

  options = {
    ...(options || {}),
  };

  let previousResult;

  return {

    name: 'scss',

    setup(build) {

      build.onResolve({ filter: /\.scss$/ }, args => ({
        path: path.resolve(args.resolveDir, args.path),
        namespace: 'scss',
      }));

      build.onLoad({ filter: /.*/, namespace: 'scss' }, async args => {
        let result, errors;
        try {
          result = sass.renderSync({
            ...options,
            file: args.path,
          });
          previousResult = result;
        }
        catch (error) {
          errors = [{
            text: error.message,
            // location:,
            // detail:,
          }];
        }
        return {
          contents: (result || previousResult)?.css.toString(),
          errors,
          loader: 'css',
          watchFiles: (result || previousResult)?.stats.includedFiles,
        };
      });
    },
  };
};
