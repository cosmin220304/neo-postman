/**
 * useRequest hook - handles sending HTTP requests through the proxy
 *
 * @module hooks/useRequest
 */

import { useCallback } from 'react';
import { useRequestStore, selectCurrentRequest } from '../stores';
import { api } from '../services/api';
import { addHistoryEntry } from '../services/db';
import type { ProxyRequest, Header } from '../types';

/**
 * Hook for sending HTTP requests through the backend proxy
 *
 * @returns Object with send function and loading state
 *
 * @example
 * ```tsx
 * const { sendRequest, loading } = useRequest();
 *
 * const handleSend = () => {
 *   sendRequest();
 * };
 * ```
 */
export function useRequest() {
  const {
    loading,
    setLoading,
    setResponse,
  } = useRequestStore();

  const sendRequest = useCallback(async () => {
    const state = useRequestStore.getState();
    const currentRequest = selectCurrentRequest(state);

    // Validate and trim URL
    let url = currentRequest.url.trim();
    if (!url) {
      return;
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    setLoading(true);
    setResponse(null);

    const startTime = Date.now();

    try {
      // Build proxy request
      const proxyRequest: ProxyRequest = {
        method: currentRequest.method,
        url,
        headers: headersToRecord(currentRequest.headers),
        body: currentRequest.body?.content ?? null,
        timeout: currentRequest.timeout,
      };

      // Send through proxy
      const response = await api.proxy(proxyRequest);

      // Convert response headers to array format
      const responseHeaders: Header[] = Object.entries(response.headers).map(
        ([key, value]) => ({
          key,
          value,
          enabled: true,
        })
      );

      // Update response state
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: response.body,
        bodyTruncated: response.bodyTruncated,
        size: response.size,
        timing: response.timing,
        error: response.error,
        loading: false,
      });

      // Save to history
      try {
        await addHistoryEntry({
          request: {
            method: currentRequest.method,
            url,
            headers: currentRequest.headers.filter(h => h.key.trim() !== ''),
            body: currentRequest.body?.content ?? null,
            authType: currentRequest.auth?.type ?? 'none',
          },
          response: response.error
            ? null
            : {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body: response.body,
                bodyTruncated: response.bodyTruncated,
                size: response.size,
              },
          timing: response.timing,
          error: response.error,
          environmentId: null,
          savedRequestId: state.savedRequestId ?? null,
        });
      } catch (historyError) {
        console.error('Failed to save to history:', historyError);
      }
    } catch (error) {
      // Handle API client errors
      const errorMessage = error instanceof Error ? error.message : 'Request failed';

      setResponse({
        status: 0,
        statusText: '',
        headers: [],
        body: '',
        bodyTruncated: false,
        size: 0,
        timing: {
          total: Date.now() - startTime,
        },
        error: {
          type: 'unknown',
          message: errorMessage,
        },
        loading: false,
      });

      // Save failed request to history
      try {
        await addHistoryEntry({
          request: {
            method: currentRequest.method,
            url,
            headers: currentRequest.headers.filter(h => h.key.trim() !== ''),
            body: currentRequest.body?.content ?? null,
            authType: currentRequest.auth?.type ?? 'none',
          },
          response: null,
          timing: {
            total: Date.now() - startTime,
          },
          error: {
            type: 'unknown',
            message: errorMessage,
          },
          environmentId: null,
          savedRequestId: state.savedRequestId ?? null,
        });
      } catch (historyError) {
        console.error('Failed to save to history:', historyError);
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, setResponse]);

  return {
    sendRequest,
    loading,
  };
}

/**
 * Convert headers array to Record for proxy request
 */
function headersToRecord(headers: Header[]): Record<string, string> {
  const record: Record<string, string> = {};

  for (const header of headers) {
    if (header.enabled && header.key.trim()) {
      record[header.key] = header.value;
    }
  }

  return record;
}
