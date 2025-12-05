/**
 * Proxy route handler - forwards HTTP requests to bypass CORS
 *
 * @module routes/proxy
 */

import { Hono } from 'hono';
import { ProxyRequestSchema } from '../models/schema.ts';
import { executeProxyRequest } from '../services/proxy.service.ts';

const proxy = new Hono();

/**
 * POST /api/proxy
 * Execute a proxied HTTP request
 *
 * @body ProxyRequest - The request configuration
 * @returns ProxyResponse - The response from the target server
 */
proxy.post('/', async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json();
    const parseResult = ProxyRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
          details: parseResult.error.flatten(),
        },
        400
      );
    }

    const request = parseResult.data;

    // Execute the proxy request
    const response = await executeProxyRequest(request);

    // Return the response
    return c.json(response);
  } catch (error) {
    console.error('Proxy error:', error);

    return c.json(
      {
        error: 'proxy_error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      500
    );
  }
});

export { proxy };
