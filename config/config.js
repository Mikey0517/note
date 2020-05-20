const path = require( 'path' );

module.exports = {
  dev: {
    assetsSubDirectory: 'assets',
    proxyTable: {
      "/v8": {
        target: "https://c.y.qq.com",
        secure: false
      },
      "/api": {
        target: "http://localhost:8080",
        secure: false
      },
    }
  },
  build: {
    assetsSubDirectory: 'assets'
  }
}