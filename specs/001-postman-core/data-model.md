# Data Model: Neo-Postman Core

**Feature**: 001-postman-core  
**Date**: 2025-12-05

## Overview

The data model is split between:
- **Frontend (IndexedDB)**: Local storage for all user data, offline-capable
- **Backend (SQLite)**: Sync server storage for shared projects

Both use the same entity shapes with Zod schemas for validation.

## Entities

### Environment

A named configuration containing variables for request substitution.

```typescript
interface Environment {
  id: string;                    // UUID
  name: string;                  // e.g., "Development", "Production"
  variables: Variable[];         // Key-value pairs
  isActive: boolean;             // Only one active at a time
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  syncProjectId: string | null;  // null = local only
}

interface Variable {
  key: string;                   // Variable name (no braces)
  value: string;                 // Variable value
  enabled: boolean;              // Can disable without deleting
}
```

**Validation Rules**:
- `name`: 1-100 characters, non-empty
- `variables[].key`: 1-50 characters, alphanumeric + underscore, no spaces
- `variables[].value`: 0-10,000 characters
- Only one environment can have `isActive: true` at a time (per sync project or local)

**Indexes** (IndexedDB):
- `id` (primary)
- `syncProjectId` (for filtering synced vs local)
- `isActive`

---

### Collection

A named container for organizing requests and folders.

```typescript
interface Collection {
  id: string;                    // UUID
  name: string;                  // e.g., "User API"
  description: string;           // Optional description
  auth: AuthConfig | null;       // Collection-level auth (inherited by requests)
  sortOrder: number;             // For manual ordering in sidebar
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  syncProjectId: string | null;  // null = local only
}
```

**Validation Rules**:
- `name`: 1-100 characters, non-empty
- `description`: 0-1,000 characters
- `sortOrder`: integer >= 0

**Indexes** (IndexedDB):
- `id` (primary)
- `syncProjectId`
- `sortOrder`

---

### Folder

A container within a collection for grouping requests. Supports nesting.

```typescript
interface Folder {
  id: string;                    // UUID
  name: string;                  // e.g., "Authentication"
  collectionId: string;          // Parent collection
  parentFolderId: string | null; // null = direct child of collection
  auth: AuthConfig | null;       // Folder-level auth (overrides collection)
  sortOrder: number;             // For manual ordering
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**Validation Rules**:
- `name`: 1-100 characters, non-empty
- `parentFolderId`: Must be in same collection or null
- Max nesting depth: 3 levels (enforced at application layer)
- `sortOrder`: integer >= 0

**Indexes** (IndexedDB):
- `id` (primary)
- `collectionId`
- `parentFolderId`
- `[collectionId, sortOrder]` (compound)

---

### Request (Saved)

A saved HTTP request configuration.

```typescript
interface SavedRequest {
  id: string;                    // UUID
  name: string;                  // e.g., "Get User by ID"
  method: HttpMethod;            // GET, POST, etc.
  url: string;                   // May contain {{variables}}
  headers: Header[];             // Request headers
  body: RequestBody | null;      // null for GET/HEAD/OPTIONS
  auth: AuthConfig | null;       // Request-level auth (overrides folder/collection)
  timeout: number;               // Milliseconds, 0 = no timeout
  collectionId: string;          // Parent collection
  folderId: string | null;       // null = direct child of collection
  sortOrder: number;             // For manual ordering
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestBody {
  type: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  content: string;               // JSON string, form data, or raw text
  binaryFileName?: string;       // For binary type, the file name
}

interface AuthConfig {
  type: 'none' | 'bearer' | 'api-key';
  bearer?: {
    token: string;               // May contain {{variables}}
  };
  apiKey?: {
    key: string;                 // Header/query param name
    value: string;               // May contain {{variables}}
    in: 'header' | 'query';
  };
}
```

**Validation Rules**:
- `name`: 1-200 characters, non-empty
- `method`: One of defined HttpMethod values
- `url`: 1-2,000 characters (may be just `{{baseUrl}}/path`)
- `headers[].key`: 1-100 characters
- `headers[].value`: 0-8,000 characters
- `body.content`: 0-5,000,000 characters (5MB)
- `timeout`: 0-300,000 ms (0 = no timeout, max 5 minutes)

**Indexes** (IndexedDB):
- `id` (primary)
- `collectionId`
- `folderId`
- `[collectionId, sortOrder]` (compound)

---

### HistoryEntry

An immutable record of a sent request and its response.

```typescript
interface HistoryEntry {
  id: string;                    // UUID
  timestamp: string;             // ISO 8601 when request was sent
  
  // Request snapshot (resolved variables, not templates)
  request: {
    method: HttpMethod;
    url: string;                 // Fully resolved URL
    headers: Header[];           // Resolved headers
    body: string | null;         // Resolved body
    authType: 'none' | 'bearer' | 'api-key';
  };
  
  // Response data
  response: {
    status: number;              // HTTP status code
    statusText: string;          // e.g., "OK", "Not Found"
    headers: Header[];
    body: string;                // Truncated at 10MB
    bodyTruncated: boolean;      // true if original exceeded 10MB
    size: number;                // Response size in bytes
  } | null;                      // null if request failed (network error, timeout)
  
  // Timing
  timing: {
    total: number;               // Total time in ms
    dns?: number;                // DNS lookup time
    connect?: number;            // TCP connection time
    tls?: number;                // TLS handshake time
    firstByte?: number;          // Time to first byte
    download?: number;           // Content download time
  };
  
  // Error info (if request failed)
  error: {
    type: 'timeout' | 'network' | 'dns' | 'ssl' | 'unknown';
    message: string;
  } | null;
  
  // Metadata
  environmentId: string | null;  // Which environment was active
  savedRequestId: string | null; // If sent from a saved request
}
```

**Validation Rules**:
- `response.body`: Max 10,000,000 characters (10MB), truncated if larger
- `timing.total`: >= 0

**Indexes** (IndexedDB):
- `id` (primary)
- `timestamp` (for chronological listing)
- `request.url` (for search)
- `request.method` (for filtering)
- `response.status` (for filtering)
- `[timestamp]` (for date range queries)

---

### SyncProject

A shared workspace for team collaboration. **Backend only**.

```typescript
interface SyncProject {
  id: string;                    // UUID
  name: string;                  // Project identifier (user-chosen)
  passwordHash: string;          // bcrypt hash of password
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**Validation Rules**:
- `name`: 3-50 characters, alphanumeric + hyphen + underscore
- `name`: Must be unique across all projects
- Password (before hashing): 8-100 characters

**Indexes** (SQLite):
- `id` (primary)
- `name` (unique)

---

### SyncChange

Tracks changes for synchronization. **Backend only**.

```typescript
interface SyncChange {
  id: string;                    // UUID
  projectId: string;             // SyncProject.id
  entityType: 'environment' | 'collection' | 'folder' | 'request';
  entityId: string;              // ID of the changed entity
  operation: 'create' | 'update' | 'delete';
  data: string | null;           // JSON serialized entity (null for delete)
  timestamp: string;             // ISO 8601, used for sync ordering
  clientId: string;              // Which client made the change
}
```

**Indexes** (SQLite):
- `id` (primary)
- `projectId`
- `[projectId, timestamp]` (compound, for sync queries)

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         SyncProject                              │
│                    (Backend SQLite only)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ 1:N (optional)
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Environment   │ │   Collection    │ │   SyncChange    │
│                 │ │                 │ │ (Backend only)  │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │ 1:N
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
           ┌─────────────┐    ┌─────────────┐
           │   Folder    │    │SavedRequest │
           │             │    │(direct)     │
           └──────┬──────┘    └─────────────┘
                  │ 1:N (self-ref, max 3 levels)
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────┐    ┌─────────────┐
│   Folder    │    │SavedRequest │
│  (nested)   │    │(in folder)  │
└─────────────┘    └─────────────┘


┌─────────────────┐
│  HistoryEntry   │ (Local only, not synced)
│                 │
│  references:    │
│  - environmentId│
│  - savedRequestId│
└─────────────────┘
```

## Zod Schemas

Schemas will be defined in `shared/schemas.ts` and used by both frontend and backend:

```typescript
// shared/schemas.ts
import { z } from 'zod';

export const VariableSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  value: z.string().max(10000),
  enabled: z.boolean(),
});

export const HttpMethodSchema = z.enum([
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'
]);

export const HeaderSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(8000),
  enabled: z.boolean(),
});

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

export const EnvironmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  variables: z.array(VariableSchema),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  syncProjectId: z.string().uuid().nullable(),
});

// ... additional schemas for Collection, Folder, SavedRequest, etc.
```

## Migration Strategy

### Initial Setup
1. Create IndexedDB database with version 1
2. Create all tables with indexes
3. No data migration needed (greenfield)

### Future Migrations
- Dexie.js supports schema versioning
- Each schema change bumps database version
- Upgrade functions transform existing data
