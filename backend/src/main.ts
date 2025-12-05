import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/deno';
import { proxy } from './routes/proxy.ts';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route('/api/proxy', proxy);

// Serve static frontend files (production)
app.use('/*', serveStatic({ root: './static' }));

// SPA fallback - serve index.html for all non-API routes
app.get('*', serveStatic({ path: './static/index.html' }));

const port = parseInt(Deno.env.get('PORT') || '8000');

console.log(`Neo-Postman starting on port ${port}...`);

Deno.serve({ port }, app.fetch);
