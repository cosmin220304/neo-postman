/**
 * TypeScript types for Neo-Postman
 * Inferred from Zod schemas for type safety
 *
 * @module types
 */

import { z } from 'zod';
import {
  VariableSchema,
  HttpMethodSchema,
  HeaderSchema,
  BodyTypeSchema,
  RequestBodySchema,
  AuthConfigSchema,
  EnvironmentSchema,
  CollectionSchema,
  FolderSchema,
  SavedRequestSchema,
  TimingSchema,
  RequestErrorSchema,
  HistoryEntrySchema,
  ProxyRequestSchema,
  ProxyResponseSchema,
  SyncProjectInfoSchema,
  SyncChangeSchema,
} from './schemas';

// ============================================================================
// Primitive Types
// ============================================================================

/** Variable key-value pair */
export type Variable = z.infer<typeof VariableSchema>;

/** Supported HTTP methods */
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

/** Request header */
export type Header = z.infer<typeof HeaderSchema>;

/** Request body type */
export type BodyType = z.infer<typeof BodyTypeSchema>;

/** Request body */
export type RequestBody = z.infer<typeof RequestBodySchema>;

/** Authentication configuration */
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// ============================================================================
// Entity Types
// ============================================================================

/** Environment with variables */
export type Environment = z.infer<typeof EnvironmentSchema>;

/** Collection container */
export type Collection = z.infer<typeof CollectionSchema>;

/** Folder within a collection */
export type Folder = z.infer<typeof FolderSchema>;

/** Saved request configuration */
export type SavedRequest = z.infer<typeof SavedRequestSchema>;

/** Request timing information */
export type Timing = z.infer<typeof TimingSchema>;

/** Request error information */
export type RequestError = z.infer<typeof RequestErrorSchema>;

/** History entry (immutable record) */
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// ============================================================================
// API Types
// ============================================================================

/** Proxy request payload */
export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;

/** Proxy response */
export type ProxyResponse = z.infer<typeof ProxyResponseSchema>;

/** Sync project info */
export type SyncProjectInfo = z.infer<typeof SyncProjectInfoSchema>;

/** Sync change record */
export type SyncChange = z.infer<typeof SyncChangeSchema>;

// ============================================================================
// UI State Types
// ============================================================================

/** Current request state in the builder */
export interface RequestState {
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: RequestBody;
  auth: AuthConfig | null;
  timeout: number;
}

/** Response state after sending a request */
export interface ResponseState {
  status: number;
  statusText: string;
  headers: Header[];
  body: string;
  bodyTruncated: boolean;
  size: number;
  timing: Timing;
  error: RequestError;
  loading: boolean;
}

/** Sidebar tab */
export type SidebarTab = 'collections' | 'history';

/** Request builder tab */
export type RequestTab = 'params' | 'headers' | 'body' | 'auth';

/** Response viewer tab */
export type ResponseTab = 'body' | 'headers' | 'raw';

// ============================================================================
// Helper Types
// ============================================================================

/** Create type without id and timestamps (for creation) */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** Update type with partial fields */
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/** Entity type for sync operations */
export type SyncEntityType = 'environment' | 'collection' | 'folder' | 'request';

/** Sync operation type */
export type SyncOperation = 'create' | 'update' | 'delete';

// Re-export schemas for use in validation
export * from './schemas';
