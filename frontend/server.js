const express = require('express');
let createProxyMiddleware;
try {
  createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware;
} catch (err) {
  console.error('ОШИБКА: http-proxy-middleware не установлен!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? 'http://backend:8080' : 'http://localhost:8080');

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

const proxyMiddleware = createProxyMiddleware((pathname, req) => {

  return pathname.startsWith('/api/');
}, {
  target: API_BASE_URL,
  changeOrigin: true,
  ws: true,
  timeout: 30000,
  proxyTimeout: 30000,
  logLevel: 'debug',

  pathRewrite: {
    '^/api': '/jsf-area-check-backend/api'
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl || req.url}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ 
        error: 'Backend недоступен', 
        message: err.message,
        target: API_BASE_URL
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    console.log(`[PROXY] ${req.method} ${req.originalUrl || req.url} -> ${API_BASE_URL}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => {
        return cookie
          .replace(/Domain=[^;]+;?/gi, '')
          .replace(/Path=\/jsf-area-check-backend/gi, 'Path=/');
      });
    }
    console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl || req.url}`);
  }
});

app.use(proxyMiddleware);

app.use(express.static(__dirname, {

  index: false
}));

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>WEB LAB 4</title>
    <link rel="stylesheet" href="resources/styles.css"/>

    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/redux@4.2.1/dist/redux.js"></script>
    <script crossorigin src="https://unpkg.com/react-redux@8.1.3/dist/react-redux.js"></script>
    <script crossorigin src="https://unpkg.com/babel-standalone@6.26.0/babel.min.js"></script>
    <script>
        window.API_BASE_URL = '';
    </script>
</head>
<body>
<div id="root"></div>
<script type="text/babel" src="store.js"></script>
<script type="text/babel" src="api.js"></script>
<script type="text/babel" src="hooks.js"></script>
<script type="text/babel" src="components.js"></script>
<script type="text/babel" src="app.js"></script>
</body>
</html>
  `);
});

const http = require('http');
const checkBackend = () => {
  const url = new URL(API_BASE_URL);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: '/api/auth/me',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`Backend доступен на ${API_BASE_URL} (статус: ${res.statusCode})`);
  });
  
  req.on('error', (err) => {
    console.warn(`Backend недоступен на ${API_BASE_URL}: ${err.message}`);
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.warn(`Таймаут при проверке бэкенда на ${API_BASE_URL}`);
  });
  
  req.end();
};

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`API backend URL: ${API_BASE_URL}`);
  console.log(`Proxy настроен для /api/* -> ${API_BASE_URL}/api/*`);
  console.log(`Проверяю доступность бэкенда...`);
  setTimeout(checkBackend, 1000);
});
