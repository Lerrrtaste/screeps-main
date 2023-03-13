module.exports = function override(config, env) {
  // config.externals = ['fs'];
  // config.resolve = {"fallback": { "zlib": require.resolve('browserify-zlib') } };
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // zlib: require.resolve('browserify-zlib'),
        fs: false
      }
    }
  }
}
