
const fs = require('fs');

const { each, without } = require('lodash');


/**
 *
 * The default depcheck SCSS parser does not work for out typical setup.
 * This parser assumes the following....
 *   1. The scss import path is set to include node_modules so they are
 *      imported like this: @import bourboun/...
 *   2. The scss import path is set to include the src dir *and* all imports of
 *      local src scss are done from the style dir like this: @import style/common
 *   3. All other "local" imports use relative paths that begin with a "."
 *
 **/

module.exports = filePath => {
  const content = fs.readFileSync(filePath).toString();
  const contentLines = content.match(/[^\r\n]+/g);
  const usedDeps = [];
  each(contentLines, line => {
    const match = line.match(/^\s*@import '(@)?([^.][^/]*)(\/[^.][^/]*)?/i);
    if (match) {
      if (match[1]) usedDeps.push(match[1] + match[2] + match[3]);
      else usedDeps.push(match[2]);
    }
  });
  return without(usedDeps, 'style');
};

