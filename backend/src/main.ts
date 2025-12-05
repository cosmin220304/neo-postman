import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
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

// TODO: Add routes
// app.route('/api/proxy', proxyRoutes);
// app.route('/api/sync', syncRoutes);

const port = parseInt(Deno.env.get('PORT') || '8000');

console.log(`Neo-Postman backend starting on port ${port}...`);

Deno.serve({ port }, app.fetch);
