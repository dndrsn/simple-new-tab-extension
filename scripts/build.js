const esbuild = require('esbuild');
const yaml = require('js-yaml');
const fse = require('fs-extra');
const cpx = require('cpx');
const path = require('path');
const { each } = require('lodash');

const esbuildConfig = require('../esbuild.config');


const copyConfig = yaml.load(fse.readFileSync('copy.config.yml'));


const compile = async () => {
  try {
    await esbuild.build(esbuildConfig);
  }
  catch {
    process.exit(1);
  }
};


const copy = async () => {
  each(copyConfig.sources, source => {
    const sourcePath = typeof source === 'string' ? source : source.path;
    const destPath = source.context ? path.join(copyConfig.dest, source.context) : copyConfig.dest;
    cpx.copy(sourcePath, destPath);
  });
};


compile();
copy();

