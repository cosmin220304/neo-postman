/**
 * API client service for communicating with the backend
 *
 * @module services/api
 */

import type { ProxyRequest, ProxyResponse } from '../types';
import { ProxyResponseSchema } from '../types/schemas';

/** Backend API base URL - empty string for same-origin (production), localhost for dev */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * API client for backend communication
 */
export const api = {
  /**
   * Send a request through the CORS proxy
   *
   * @param request - The request configuration
   * @returns Promise resolving to the proxy response
   *
   * @example
   * ```typescript
   * const response = await api.proxy({
   *   method: 'GET',
   *   url: 'https://api.example.com/data',
   *   headers: { 'Authorization': 'Bearer token' },
   *   timeout: 30000,
   * });
   * ```
   */
  async proxy(request: ProxyRequest): Promise<ProxyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Proxy request failed' }));
      throw new ApiError(response.status, error.message ?? 'Proxy request failed');
    }

    const data = await response.json();

    // Validate response schema
    const parsed = ProxyResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid proxy response:', parsed.error);
      throw new ApiError(500, 'Invalid response from proxy server');
    }

    return parsed.data;
  },

  /**
   * Check if the backend server is healthy
   *
   * @returns Promise resolving to true if healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Create a new sync project
   *
   * @param name - Project name
   * @param password - Project password
   * @returns Promise resolving to project info with token
   */
  async createSyncProject(name: string, password: string): Promise<{ id: string; token: string }> {
    const response = await fetch(`${API_BASE_URL}/api/sync/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create project' }));
      throw new ApiError(response.status, error.message);
    }

    return response.json();
  },

  /**
   * Join an existing sync project
   *
   * @param name - Project name
   * @param password - Project password
   * @returns Promise resolving to project info with token
   */
  async joinSyncProject(name: string, password: string): Promise<{ id: string; token: string }> {
    const response = await fetch(`${API_BASE_URL}/api/sync/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to join project' }));
      throw new ApiError(response.status, error.message);
    }

    return response.json();
  },

  /**
   * Get changes from sync server
   *
   * @param projectId - Project ID
   * @param token - Auth token
   * @param since - ISO timestamp to get changes since
   * @returns Promise resolving to array of changes
   */
  async getSyncChanges(projectId: string, token: string, since?: string): Promise<unknown[]> {
    const url = new URL(`${API_BASE_URL}/api/sync/projects/${projectId}/changes`);
    if (since) {
      url.searchParams.set('since', since);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get changes' }));
      throw new ApiError(response.status, error.message);
    }

    return response.json();
  },

  /**
   * Push changes to sync server
   *
   * @param projectId - Project ID
   * @param token - Auth token
   * @param changes - Array of changes to push
   * @returns Promise resolving when complete
   */
  async pushSyncChanges(
    projectId: string,
    token: string,
    changes: unknown[]
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sync/projects/${projectId}/changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ changes }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to push changes' }));
      throw new ApiError(response.status, error.message);
    }
  },
};

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
