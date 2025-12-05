/**
 * Backend Zod schemas for request/response validation
 *
 * @module models/schema
 */

import { z } from 'zod';

// ============================================================================
// HTTP Primitives
// ============================================================================

/**
 * HTTP methods supported by the proxy
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

export type HttpMethod = z.infer<typeof HttpMethodSchema>;

// ============================================================================
// Proxy Schemas
// ============================================================================

/**
 * Proxy request schema - validated input from frontend
 */
export const ProxyRequestSchema = z.object({
  method: HttpMethodSchema,
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.string().nullable().optional(),
  timeout: z.number().int().min(0).max(300000).default(30000),
});

export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;

/**
 * Timing information for proxy response
 */
export const TimingSchema = z.object({
  total: z.number().nonnegative(),
  dns: z.number().nonnegative().optional(),
  connect: z.number().nonnegative().optional(),
  tls: z.number().nonnegative().optional(),
  firstByte: z.number().nonnegative().optional(),
  download: z.number().nonnegative().optional(),
});

export type Timing = z.infer<typeof TimingSchema>;

/**
 * Error information for failed requests
 */
export const RequestErrorSchema = z
  .object({
    type: z.enum(['timeout', 'network', 'dns', 'ssl', 'unknown']),
    message: z.string(),
  })
  .nullable();

export type RequestError = z.infer<typeof RequestErrorSchema>;

/**
 * Proxy response schema - output to frontend
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

export type ProxyResponse = z.infer<typeof ProxyResponseSchema>;

// ============================================================================
// Sync Schemas
// ============================================================================

/**
 * Create sync project request
 */
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;

/**
 * Join sync project request
 */
export const JoinProjectSchema = z.object({
  name: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

export type JoinProjectRequest = z.infer<typeof JoinProjectSchema>;

/**
 * Sync project info response
 */
export const ProjectInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
  createdAt: z.string().datetime(),
});

export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;

/**
 * Entity types that can be synced
 */
export const SyncEntityTypeSchema = z.enum(['environment', 'collection', 'folder', 'request']);

export type SyncEntityType = z.infer<typeof SyncEntityTypeSchema>;

/**
 * Sync operation types
 */
export const SyncOperationSchema = z.enum(['create', 'update', 'delete']);

export type SyncOperation = z.infer<typeof SyncOperationSchema>;

/**
 * Sync change record
 */
export const SyncChangeSchema = z.object({
  id: z.string().uuid(),
  entityType: SyncEntityTypeSchema,
  entityId: z.string().uuid(),
  operation: SyncOperationSchema,
  data: z.unknown().nullable(),
  timestamp: z.string().datetime(),
  clientId: z.string(),
});

export type SyncChange = z.infer<typeof SyncChangeSchema>;

/**
 * Push changes request
 */
export const PushChangesSchema = z.object({
  changes: z.array(SyncChangeSchema),
});

export type PushChangesRequest = z.infer<typeof PushChangesSchema>;

// ============================================================================
// Error Response
// ============================================================================

/**
 * Standard error response
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
