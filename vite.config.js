import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/solicitudes.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-solicitudes-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/solicitudes')) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                if (body) {
                  req.body = JSON.parse(body);
                }
              } catch {
                req.body = {};
              }

              // Mock helper for res.status().json()
              const mockRes = {
                statusCode: 200,
                headers: {},
                setHeader(k, v) { this.headers[k] = v; res.setHeader(k, v); return this; },
                status(code) { this.statusCode = code; res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end(data) { res.end(data); }
              };

              try {
                await handler(req, mockRes);
              } catch (err) {
                console.error('Error en middleware API:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
