
const { filter } = require('lodash');
const fs = require('fs');
const path = require('path');


module.exports = (filePath, deps) => {
  // The default webpack parser does not pickup modules that are used with "string syntax" like
  // the following: loader: 'eslint-loader'
  // This parser will include those modules in the "used dependencies list".
  // It will not add any additional "unused" dependencies using that syntax.
  // This could be made more sofisticated to work "both ways", but It is assumed that missing deps
  // will be captured by the build failing if they are used so that is not really a concern here.
  const filename = path.basename(filePath);
  if (filename !== 'webpack.config.js') return [];
  const content = fs.readFileSync(filePath).toString();
  const usedDeps = filter(deps, dep => RegExp(`['"\`]${dep}['"\`]`, 'gm').test(content));
  return usedDeps;
};

