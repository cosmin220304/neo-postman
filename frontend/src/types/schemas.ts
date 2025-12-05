/**
 * Shared Zod schemas for Neo-Postman
 * Used for runtime validation of data structures
 *
 * @module schemas
 */

import { z } from 'zod';

// ============================================================================
// Primitive Schemas
// ============================================================================

/**
 * Variable schema - key-value pair for environment substitution
 */
export const VariableSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable key must be alphanumeric with underscores'),
  value: z.string().max(10000),
  enabled: z.boolean(),
});

/**
 * HTTP methods supported by the application
 */
export const HttpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

/**
 * Request header schema
 */
export const HeaderSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(8000),
  enabled: z.boolean(),
});

/**
 * Request body type
 */
export const BodyTypeSchema = z.enum([
  'json',
  'form-data',
  'x-www-form-urlencoded',
  'raw',
  'binary',
]);

/**
 * Request body schema
 */
export const RequestBodySchema = z
  .object({
    type: BodyTypeSchema,
    content: z.string().max(5000000), // 5MB
    binaryFileName: z.string().optional(),
  })
  .nullable();

/**
 * Authentication configuration
 */
export const AuthConfigSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({
    type: z.literal('bearer'),
    bearer: z.object({ token: z.string() }),
  }),
  z.object({
    type: z.literal('api-key'),
    apiKey: z.object({
      key: z.string().min(1),
      value: z.string(),
      in: z.enum(['header', 'query']),
    }),
  }),
]);

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * Environment schema - contains variables for substitution
 */
export const EnvironmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  variables: z.array(VariableSchema),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  syncProjectId: z.string().uuid().nullable(),
});

/**
 * Collection schema - container for requests and folders
 */
export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).default(''),
  auth: AuthConfigSchema.nullable(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  syncProjectId: z.string().uuid().nullable(),
});

/**
 * Folder schema - nested container within a collection
 */
export const FolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  collectionId: z.string().uuid(),
  parentFolderId: z.string().uuid().nullable(),
  auth: AuthConfigSchema.nullable(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Saved request schema
 */
export const SavedRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  method: HttpMethodSchema,
  url: z.string().min(1).max(2000),
  headers: z.array(HeaderSchema),
  body: RequestBodySchema,
  auth: AuthConfigSchema.nullable(),
  timeout: z.number().int().min(0).max(300000), // 0 = no timeout, max 5 min
  collectionId: z.string().uuid(),
  folderId: z.string().uuid().nullable(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * History entry timing information
 */
export const TimingSchema = z.object({
  total: z.number().nonnegative(),
  dns: z.number().nonnegative().optional(),
  connect: z.number().nonnegative().optional(),
  tls: z.number().nonnegative().optional(),
  firstByte: z.number().nonnegative().optional(),
  download: z.number().nonnegative().optional(),
});

/**
 * History entry error information
 */
export const RequestErrorSchema = z
  .object({
    type: z.enum(['timeout', 'network', 'dns', 'ssl', 'unknown']),
    message: z.string(),
  })
  .nullable();

/**
 * History entry schema - immutable record of sent request/response
 */
export const HistoryEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),

  // Request snapshot (resolved, not templates)
  request: z.object({
    method: HttpMethodSchema,
    url: z.string(),
    headers: z.array(HeaderSchema),
    body: z.string().nullable(),
    authType: z.enum(['none', 'bearer', 'api-key']),
  }),

  // Response data
  response: z
    .object({
      status: z.number().int(),
      statusText: z.string(),
      headers: z.array(HeaderSchema),
      body: z.string(),
      bodyTruncated: z.boolean(),
      size: z.number().int().nonnegative(),
    })
    .nullable(),

  timing: TimingSchema,
  error: RequestErrorSchema,

  // Metadata
  environmentId: z.string().uuid().nullable(),
  savedRequestId: z.string().uuid().nullable(),
});

// ============================================================================
// API Schemas (for proxy and sync)
// ============================================================================

/**
 * Proxy request schema
 */
export const ProxyRequestSchema = z.object({
  method: HttpMethodSchema,
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().nullable().optional(),
  timeout: z.number().int().min(0).max(300000).default(30000),
});

/**
 * Proxy response schema
 */
export const ProxyResponseSchema = z.object({
  status: z.number().int(),
  statusText: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string(),
  bodyTruncated: z.boolean(),
  size: z.number().int().nonnegative(),
  timing: TimingSchema,
  error: RequestErrorSchema,
});

/**
 * Sync project info schema
 */
export const SyncProjectInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
  createdAt: z.string().datetime(),
});

/**
 * Sync change schema
 */
export const SyncChangeSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['environment', 'collection', 'folder', 'request']),
  entityId: z.string().uuid(),
  operation: z.enum(['create', 'update', 'delete']),
  data: z.unknown().nullable(),
  timestamp: z.string().datetime(),
  clientId: z.string(),
});
