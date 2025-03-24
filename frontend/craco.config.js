const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          ...webpackConfig.resolve.fallback,
          querystring: require.resolve('querystring-es3')
        }
      };
      return webpackConfig;
    }
  }
}; 