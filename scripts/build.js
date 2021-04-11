const esbuild = require('esbuild');

const esbuildConfig = require('../esbuild.config');


const build = async () => {
  try {
    await esbuild.build(esbuildConfig);
  }
  catch {
    process.exit(1);
  }
};


build();

