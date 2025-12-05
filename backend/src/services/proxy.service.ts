/**
 * Proxy service - handles HTTP requests on behalf of the frontend
 * Bypasses CORS restrictions and measures timing
 *
 * @module services/proxy.service
 */

import type { ProxyRequest, ProxyResponse, RequestError, Timing } from '../models/schema.ts';

/** Maximum response body size (10MB) */
const MAX_BODY_SIZE = 10 * 1024 * 1024;

/**
 * Execute a proxied HTTP request
 *
 * @param request - The proxy request configuration
 * @returns Promise resolving to the proxy response
 *
 * @example
 * ```typescript
 * const response = await executeProxyRequest({
 *   method: 'GET',
 *   url: 'https://api.example.com/data',
 *   headers: { 'Authorization': 'Bearer token' },
 *   timeout: 30000,
 * });
 * ```
 */
export async function executeProxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
  const startTime = performance.now();
  let firstByteTime: number | undefined;

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    let timeoutId: number | undefined;

    if (request.timeout > 0) {
      timeoutId = setTimeout(() => controller.abort(), request.timeout);
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: request.headers ?? {},
      signal: controller.signal,
    };

    // Add body for non-GET/HEAD requests
    if (request.body && !['GET', 'HEAD'].includes(request.method)) {
      fetchOptions.body = request.body;
    }

    // Execute the request
    const response = await fetch(request.url, fetchOptions);

    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Mark first byte time
    firstByteTime = performance.now();

    // Read response body with size limit
    const { body, truncated, size } = await readResponseBody(response);

    // Calculate timing
    const endTime = performance.now();
    const timing: Timing = {
      total: Math.round(endTime - startTime),
      firstByte: Math.round(firstByteTime - startTime),
      download: Math.round(endTime - firstByteTime),
    };

    // Convert headers to record
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      bodyTruncated: truncated,
      size,
      timing,
      error: null,
    };
  } catch (error) {
    const endTime = performance.now();
    const timing: Timing = {
      total: Math.round(endTime - startTime),
      firstByte: firstByteTime ? Math.round(firstByteTime - startTime) : undefined,
    };

    return {
      status: 0,
      statusText: '',
      headers: {},
      body: '',
      bodyTruncated: false,
      size: 0,
      timing,
      error: categorizeError(error),
    };
  }
}

/**
 * Read response body with size limit
 *
 * @param response - Fetch response object
 * @returns Body string, truncation flag, and actual size
 */
async function readResponseBody(
  response: Response
): Promise<{ body: string; truncated: boolean; size: number }> {
  // Check content-length header first
  const contentLength = response.headers.get('content-length');
  const declaredSize = contentLength ? parseInt(contentLength, 10) : null;

  // If declared size is over limit, read partial
  if (declaredSize && declaredSize > MAX_BODY_SIZE) {
    const reader = response.body?.getReader();
    if (!reader) {
      return { body: '', truncated: false, size: 0 };
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (totalSize < MAX_BODY_SIZE) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      totalSize += value.length;
    }

    // Cancel the rest
    await reader.cancel();

    // Concatenate chunks
    const combined = new Uint8Array(Math.min(totalSize, MAX_BODY_SIZE));
    let offset = 0;
    for (const chunk of chunks) {
      const remaining = MAX_BODY_SIZE - offset;
      const toCopy = Math.min(chunk.length, remaining);
      combined.set(chunk.subarray(0, toCopy), offset);
      offset += toCopy;
      if (offset >= MAX_BODY_SIZE) break;
    }

    const body = new TextDecoder().decode(combined);
    return { body, truncated: true, size: declaredSize };
  }

  // Read full body
  const arrayBuffer = await response.arrayBuffer();
  const size = arrayBuffer.byteLength;

  if (size > MAX_BODY_SIZE) {
    const truncatedBuffer = arrayBuffer.slice(0, MAX_BODY_SIZE);
    const body = new TextDecoder().decode(truncatedBuffer);
    return { body, truncated: true, size };
  }

  const body = new TextDecoder().decode(arrayBuffer);
  return { body, truncated: false, size };
}

/**
 * Categorize fetch errors into known types
 *
 * @param error - The caught error
 * @returns Categorized error object
 */
function categorizeError(error: unknown): RequestError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Timeout (AbortError from AbortController)
    if (error.name === 'AbortError' || message.includes('abort')) {
      return {
        type: 'timeout',
        message: 'Request timed out',
      };
    }

    // DNS errors
    if (message.includes('dns') || message.includes('getaddrinfo') || message.includes('resolve')) {
      return {
        type: 'dns',
        message: `DNS lookup failed: ${error.message}`,
      };
    }

    // SSL/TLS errors
    if (message.includes('ssl') || message.includes('tls') || message.includes('certificate')) {
      return {
        type: 'ssl',
        message: `SSL/TLS error: ${error.message}`,
      };
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('connect') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('enotfound')
    ) {
      return {
        type: 'network',
        message: `Network error: ${error.message}`,
      };
    }

    // Unknown error with message
    return {
      type: 'unknown',
      message: error.message,
    };
  }

  // Completely unknown error
  return {
    type: 'unknown',
    message: 'An unknown error occurred',
  };
}
