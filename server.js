const http = require('http');
const httpProxy = require('http-proxy');

const PORT = process.env.PORT || 3000;

// Oracle VPS VLESS origin
const ORIGIN_HOST = 'panel.satish.ggff.net';
const ORIGIN_PORT = 443;

const proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'https:',
    host: ORIGIN_HOST,
    port: ORIGIN_PORT
  },
  changeOrigin: true,
  ws: true,
  secure: true
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);

  if (res && !res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'text/plain'
    });
  }

  if (res) {
    res.end('Bad Gateway');
  }
});

const server = http.createServer((req, res) => {
  console.log(`HTTP ${req.method} ${req.url}`);
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  console.log(`WebSocket ${req.url}`);
  proxy.ws(req, socket, head);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DigitalOcean VLESS proxy listening on ${PORT}`);
  console.log(`Origin: https://${ORIGIN_HOST}:${ORIGIN_PORT}`);
});
