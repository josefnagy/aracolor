module.exports = {
  server: {
    baseDir: 'public',
    routes: { '/data': 'data' },
  },
  files: ['public/**/*', 'data/**/*'],
  port: 3001,
  middleware: [
    function(req, res, next) {
      if (req.url.startsWith('/api/')) {
        var http = require('http');
        var proxy = http.request(
          { hostname: 'localhost', port: 3000, path: req.url, method: req.method, headers: req.headers },
          function(proxyRes) { res.writeHead(proxyRes.statusCode, proxyRes.headers); proxyRes.pipe(res); }
        );
        req.pipe(proxy);
        proxy.on('error', function() { next(); });
      } else {
        next();
      }
    }
  ],
};
