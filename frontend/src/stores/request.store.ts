/**
 * Request builder store - manages the current request being edited
 *
 * @module stores/request.store
 */

import { create } from 'zustand';
import type { HttpMethod, Header, RequestBody, AuthConfig, ResponseState } from '../types';

interface RequestState {
  /** HTTP method */
  method: HttpMethod;
  /** Request URL (may contain {{variables}}) */
  url: string;
  /** Request headers */
  headers: Header[];
  /** Request body */
  body: RequestBody;
  /** Authentication configuration */
  auth: AuthConfig;
  /** Request timeout in ms (0 = no timeout) */
  timeout: number;
  /** Current response state */
  response: ResponseState | null;
  /** Whether request is currently loading */
  loading: boolean;
  /** ID of the saved request being edited (null = new request) */
  savedRequestId: string | null;
  /** Whether the request has unsaved changes */
  isDirty: boolean;
}

interface RequestActions {
  /** Set the HTTP method */
  setMethod: (method: HttpMethod) => void;
  /** Set the URL */
  setUrl: (url: string) => void;
  /** Set all headers */
  setHeaders: (headers: Header[]) => void;
  /** Add a new header */
  addHeader: (header?: Partial<Header>) => void;
  /** Update a header at index */
  updateHeader: (index: number, header: Partial<Header>) => void;
  /** Remove a header at index */
  removeHeader: (index: number) => void;
  /** Toggle header enabled state */
  toggleHeader: (index: number) => void;
  /** Set the request body */
  setBody: (body: RequestBody) => void;
  /** Set authentication config */
  setAuth: (auth: AuthConfig) => void;
  /** Set request timeout */
  setTimeout: (timeout: number) => void;
  /** Set response state */
  setResponse: (response: ResponseState | null) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Load a saved request into the builder */
  loadRequest: (request: {
    method: HttpMethod;
    url: string;
    headers: Header[];
    body: RequestBody;
    auth: AuthConfig | null;
    timeout: number;
    id?: string;
  }) => void;
  /** Reset to a new empty request */
  resetRequest: () => void;
  /** Mark request as clean (saved) */
  markClean: () => void;
}

type RequestStore = RequestState & RequestActions;

const initialState: RequestState = {
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true }],
  body: null,
  auth: { type: 'none' },
  timeout: 30000,
  response: null,
  loading: false,
  savedRequestId: null,
  isDirty: false,
};

/**
 * Request builder store
 *
 * @example
 * ```tsx
 * const { method, url, setMethod, setUrl } = useRequestStore();
 * ```
 */
export const useRequestStore = create<RequestStore>((set, _get) => ({
  ...initialState,

  setMethod: (method) => set({ method, isDirty: true }),

  setUrl: (url) => set({ url, isDirty: true }),

  setHeaders: (headers) => set({ headers, isDirty: true }),

  addHeader: (header) =>
    set((state) => ({
      headers: [...state.headers, { key: '', value: '', enabled: true, ...header }],
      isDirty: true,
    })),

  updateHeader: (index, updates) =>
    set((state) => ({
      headers: state.headers.map((h, i) => (i === index ? { ...h, ...updates } : h)),
      isDirty: true,
    })),

  removeHeader: (index) =>
    set((state) => ({
      headers: state.headers.filter((_, i) => i !== index),
      isDirty: true,
    })),

  toggleHeader: (index) =>
    set((state) => ({
      headers: state.headers.map((h, i) =>
        i === index ? { ...h, enabled: !h.enabled } : h
      ),
      isDirty: true,
    })),

  setBody: (body) => set({ body, isDirty: true }),

  setAuth: (auth) => set({ auth, isDirty: true }),

  setTimeout: (timeout) => set({ timeout, isDirty: true }),

  setResponse: (response) => set({ response }),

  setLoading: (loading) => set({ loading }),

  loadRequest: (request) =>
    set({
      method: request.method,
      url: request.url,
      headers:
        request.headers.length > 0
          ? request.headers
          : [{ key: '', value: '', enabled: true }],
      body: request.body,
      auth: request.auth ?? { type: 'none' },
      timeout: request.timeout,
      savedRequestId: request.id ?? null,
      response: null,
      loading: false,
      isDirty: false,
    }),

  resetRequest: () => set({ ...initialState }),

  markClean: () => set({ isDirty: false }),
}));

/**
 * Selector for getting the current request as a serializable object
 */
export const selectCurrentRequest = (state: RequestStore) => ({
  method: state.method,
  url: state.url,
  headers: state.headers.filter((h) => h.enabled && h.key.trim() !== ''),
  body: state.body,
  auth: state.auth,
  timeout: state.timeout,
});
