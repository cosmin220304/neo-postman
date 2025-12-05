# Research: Neo-Postman Core

**Feature**: 001-postman-core  
**Date**: 2025-12-05

## Technology Decisions

### Frontend Framework

**Decision**: React 18 + Vite

**Rationale**: 
- Best TypeScript support among major frameworks
- Large ecosystem of UI components (Monaco Editor, tree views, tabs)
- Constitution specifies "React or similar"
- Vite provides fast HMR and excellent DX

**Alternatives considered**:
- SolidJS: Smaller bundle but smaller ecosystem for complex UI components
- Svelte: Less TypeScript-native, different mental model
- Vue: Good option but React has more ready-made components for this use case

---

### State Management

**Decision**: Zustand

**Rationale**:
- Minimal boilerplate compared to Redux
- Excellent TypeScript support out of the box
- Supports persistence middleware (for localStorage/IndexedDB sync)
- Simple mental model: just functions that update state

**Alternatives considered**:
- Redux Toolkit: More ceremony, overkill for this scope
- Jotai: Good for atomic state, but Zustand better for related state groups
- TanStack Query alone: Great for server state, but need local state too

---

### Local Storage

**Decision**: IndexedDB via Dexie.js

**Rationale**:
- Large storage capacity (hundreds of MB)
- Supports complex queries needed for history search
- Dexie provides excellent TypeScript types and Promise-based API
- Works offline (required per spec)

**Alternatives considered**:
- localStorage: 5MB limit, no complex queries
- SQLite (sql.js): Heavier, WASM loading overhead
- PouchDB: CouchDB sync protocol adds complexity we don't need

---

### Backend Runtime

**Decision**: Deno 2.x

**Rationale**:
- User preference (mentioned in initial description)
- Built-in TypeScript support (no compilation step)
- Modern, secure by default
- Good SQLite support via deno.land/x/sqlite

**Alternatives considered**:
- Node.js: Would work fine but user specifically mentioned Deno
- Bun: Less mature, fewer production deployments

---

### Backend Framework

**Decision**: Hono

**Rationale**:
- Designed for edge/serverless but works great with Deno
- Excellent TypeScript support with type-safe routes
- Middleware system similar to Express
- Very fast, small footprint

**Alternatives considered**:
- Oak: More Express-like but less type-safe
- Fresh: Full-stack framework, more than we need
- bare Deno.serve: Too low-level for this project

---

### Backend Database

**Decision**: SQLite

**Rationale**:
- Simple deployment (single file)
- Sufficient for 2-20 users per project
- No separate database server needed
- Good Deno support via @db/sqlite

**Alternatives considered**:
- PostgreSQL: Overkill for this scale, adds deployment complexity
- Deno KV: Good for key-value but we need relational queries
- JSON files: No concurrent access safety

---

### CSS Framework

**Decision**: Tailwind CSS

**Rationale**:
- Constitution specifies "Tailwind CSS or CSS-in-JS"
- Utility-first approach works well for component libraries
- Good IDE support with IntelliSense
- Easy to customize design tokens

**Alternatives considered**:
- styled-components: Runtime overhead, more boilerplate
- CSS Modules: Less consistent design system

---

### Code Editor Component

**Decision**: Monaco Editor (via @monaco-editor/react)

**Rationale**:
- Powers VS Code, very mature
- Excellent JSON/text editing with syntax highlighting
- Good TypeScript types
- Supports custom languages if needed later

**Alternatives considered**:
- CodeMirror 6: Good option, slightly harder React integration
- Ace Editor: Older, less maintained

---

### Schema Validation

**Decision**: Zod

**Rationale**:
- Constitution requires runtime validation
- Excellent TypeScript inference (schema → type)
- Works in both frontend and backend
- Good error messages

**Alternatives considered**:
- io-ts: More functional, steeper learning curve
- Yup: Less TypeScript-native
- AJV: JSON Schema based, more verbose

---

### HTTP Client (Frontend → Backend)

**Decision**: Native fetch + TanStack Query

**Rationale**:
- fetch is standard, no extra dependency
- TanStack Query handles caching, retry, loading states
- Good TypeScript support
- Integrates well with Zustand

**Alternatives considered**:
- Axios: Extra dependency for minimal benefit
- ky: Nice API but TanStack Query already wraps fetch

---

### Testing

**Decision**: Vitest (unit/integration) + Playwright (E2E)

**Rationale**:
- Constitution specifies these tools
- Vitest is fast, Vite-native, Jest-compatible API
- Playwright is most reliable for cross-browser E2E
- Both have excellent TypeScript support

**Alternatives considered**:
- Jest: Slower, more config needed with Vite
- Cypress: Component testing possible but Playwright more versatile

---

## Architecture Decisions

### CORS Proxy Strategy

**Decision**: All requests proxied through backend

**Rationale**:
- Clarification session confirmed this approach
- Eliminates CORS issues completely
- Backend can add timing/logging transparently
- Single point for request transformation

**Implementation**:
- Frontend sends request config to `/api/proxy`
- Backend makes actual HTTP request
- Backend returns response with timing metadata

---

### Sync Architecture

**Decision**: Polling-based sync with optimistic updates

**Rationale**:
- Simpler than WebSockets for small team sizes
- Works through proxies/firewalls
- Offline changes queued and synced on reconnect

**Implementation**:
- Client polls `/api/sync/changes?since={timestamp}` every 5 seconds when online
- Changes sent via POST `/api/sync/push`
- Conflict resolution: last-write-wins with notification

**Alternatives considered**:
- WebSockets: More complex, marginal benefit for 2-20 users
- CRDTs: Overkill for this use case

---

### Variable Resolution

**Decision**: Client-side resolution before sending to proxy

**Rationale**:
- Keeps backend simple (just proxies bytes)
- Variables are UI/UX concern
- Supports nested variables: `{{base}}/{{path}}`

**Implementation**:
- Regex-based replacement: `/\{\{([^}]+)\}\}/g`
- Recursive resolution (max 10 depth to prevent infinite loops)
- Unresolved variables flagged in UI before send

---

### History Storage

**Decision**: Local-only in IndexedDB, not synced

**Rationale**:
- Clarification confirmed history stays local
- Privacy: users may not want to share request history
- Reduces sync complexity and storage costs

**Implementation**:
- IndexedDB table with indexes on timestamp, URL, method, status
- Full request/response stored (truncated at 10MB for response body)
- User can manually delete entries or clear all

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Frontend framework | React + Vite |
| State management | Zustand |
| Local storage | IndexedDB (Dexie.js) |
| Backend runtime | Deno 2.x |
| Backend framework | Hono |
| Backend database | SQLite |
| Sync mechanism | Polling (5s interval) |
| Variable resolution | Client-side, pre-proxy |
