module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...
  config.externals = ['ws', 'fs', 'axios', 'bluebird', 'yamljs', 'url', 'events', 'zlib', 'path', 'debug', 'util'];
  return config
}
