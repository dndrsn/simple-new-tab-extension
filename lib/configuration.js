
require('dotenv').config();
const Yargs = require('yargs/yargs');
const { camelCase, each, includes, isNil, map, transform } = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

// const { log } = require('./logging');


function Configuration({ name, options, usage, configFile, envPrefix }) {

  const yargs = Yargs(process.argv.slice(2));

  if (name) yargs.scriptName(name);
  if (usage) yargs.usage(usage);
  yargs.env(envPrefix);

  const configFilePath = configFile && glob.sync(configFile)[0];

  if (configFilePath) {
    const fileConfig = (
      configFilePath.match(/\.ya?ml$/i) ? yaml.load(fs.readFileSync(configFilePath)) :
      configFilePath.match(/\.json$/i) ? JSON.parse(fs.readFileSync(configFilePath)) :
      configFilePath.match(/\.js$/i) ? require(path.resolve(process.cwd(), configFilePath)) :
      {}
    );
    yargs.config(fileConfig);
  }

  options = map(options, option => typeof option === 'string' ? { key: option } : option);

  each(options, ({ key, props = {} }) => yargs.option(key, props));

  const configuration = transform(options, (result, { key, ...props }) => {
    let val = yargs.argv[key];
    val = convertValue(val, props);
    if (!isNil(val)) result[camelCase(key)] = val;
  }, {});

  return configuration;
}


const convertValue = (value, props) => {

  if (isNil(value)) return value;

  // if (props.string || props.type === 'string') {
  //   if (typeof value === 'string' && value.match(/^['"‘“].*['"’”]$/)) value = value.slice(1, -1);
  //   value = String(value);
  // }

  if (props.boolean || props.type === 'boolean') {
    if (typeof value === 'string' && includes(['false', 'no', 'n', 'off'], value.toLowerCase())) value = false;
    value = Boolean(value);
  }

  else if (props.number || props.type === 'number') {
    value = Number(value);
  }

  return value;
};


module.exports = Configuration;

