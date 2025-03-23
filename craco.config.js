module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          querystring: require.resolve('querystring-es3')
        }
      }
    }
  },
  devServer: {
    proxy: {
      '/yahoo-finance': {
        target: 'https://query1.finance.yahoo.com',
        pathRewrite: { '^/yahoo-finance': '' },
        changeOrigin: true,
        secure: false
      }
    }
  }
} 