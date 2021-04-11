require('module-alias/register');

const fse = require('fs-extra');

const { log } = require('../lib/logging');


const config = {
  pubDir: './pub',
};


fse.removeSync(config.pubDir);
log.debug('Clean :: removed pub files');

