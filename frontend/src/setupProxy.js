const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'warn', // Reduce logging noise
      onError: (err, req, res) => {
        console.log('Proxy error:', err.message);
        res.status(500).send('Backend connection error');
      }
    })
  );
};