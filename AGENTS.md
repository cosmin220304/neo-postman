# Neo-Postman Development Guidelines

Auto-generated from feature plans. Last updated: 2025-12-05

## Project Overview

Neo-Postman is a web-based API client (Postman alternative) with:
- HTTP request builder with all standard methods
- Environment variables with `{{variable}}` syntax
- Collections and folders for organization
- Request/response history with search
- Authorization helpers (Bearer Token, API Key)
- Team sync via project name + password

## Active Technologies

- **Language**: TypeScript 5.x (strict mode)
- **Frontend**: React 18, Vite, Zustand, TanStack Query, Tailwind CSS
- **Backend**: Deno 2.x, Hono framework
- **Storage**: IndexedDB (frontend), SQLite (backend sync server)
- **Validation**: Zod (both frontend and backend)
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure

```text
neo-postman/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── request-builder/ # Request form components
│   │   │   ├── response-viewer/ # Response display
│   │   │   ├── sidebar/         # Collections, history
│   │   │   ├── environments/    # Environment management
│   │   │   └── ui/              # Shared UI primitives
│   │   ├── hooks/               # React hooks (useRequest, etc.)
│   │   ├── stores/              # Zustand state stores
│   │   ├── services/            # API client, IndexedDB, utils
│   │   └── types/               # TypeScript type definitions
│   └── tests/
├── backend/                     # Deno + Hono server
│   ├── src/
│   │   ├── routes/              # API endpoints (proxy, sync)
│   │   ├── services/            # Business logic
│   │   ├── models/              # Zod schemas
│   │   └── db/                  # SQLite setup
│   └── tests/
├── specs/                       # Feature specifications
│   └── 001-postman-core/
└── .specify/                    # Speckit framework
```

## Commands

### Frontend
```bash
cd frontend
pnpm dev          # Development server (port 5173)
pnpm build        # Production build
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E tests
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```

### Backend
```bash
cd backend
deno task dev     # Development server (port 8000)
deno task test    # Run tests
deno task lint    # Linter
```

## Code Style

### TypeScript (Constitution Principle I)
- `strict: true` in all tsconfig.json
- No `any` types (use `unknown` + type guards)
- All function parameters and returns explicitly typed
- Zod for runtime validation of external data

### Documentation (Constitution Principle II)
- JSDoc with `@param`, `@returns`, `@example` on public APIs
- Inline comments explaining "why" for complex logic
- OpenAPI spec at `specs/001-postman-core/contracts/api.yaml`

### Testing (Constitution Principle IV)
- Test files co-located: `Component.tsx` → `Component.test.tsx`
- Arrange-Act-Assert pattern
- 80% coverage target for business logic
- E2E tests for critical user paths

## Key Patterns

### State Management
- **Zustand** for local UI state (request builder, active environment)
- **TanStack Query** for server state (sync operations)
- **IndexedDB** (via Dexie) for persistence

### Variable Resolution
```typescript
// Variables use {{name}} syntax
const resolved = resolveVariables(url, activeEnvironment.variables);
// Supports nesting: {{base}}/{{path}} → http://localhost/api
```

### CORS Proxy
All HTTP requests go through backend `/api/proxy` to bypass CORS:
```typescript
// Frontend sends request config
const response = await fetch('/api/proxy', {
  method: 'POST',
  body: JSON.stringify({ method: 'GET', url: targetUrl, headers })
});
```

### Sync Architecture
- Polling-based (5 second interval)
- Last-write-wins conflict resolution
- JWT auth per project
- History is NOT synced (local only)

## Key Files

| Purpose | Location |
|---------|----------|
| Request builder UI | `frontend/src/components/request-builder/` |
| Response display | `frontend/src/components/response-viewer/` |
| IndexedDB schema | `frontend/src/services/db.ts` |
| Proxy endpoint | `backend/src/routes/proxy.ts` |
| Sync endpoints | `backend/src/routes/sync.ts` |
| Zod schemas | `backend/src/models/schema.ts` |
| API contract | `specs/001-postman-core/contracts/api.yaml` |
| Data model | `specs/001-postman-core/data-model.md` |

## Known Gotchas

1. **Binary file uploads**: FormData must be used, not JSON body
2. **Large responses**: Truncated at 10MB, set `bodyTruncated: true`
3. **Timeout 0**: Means no timeout (wait forever), not instant timeout
4. **Env variable conflicts**: Only one environment active at a time
5. **Folder nesting**: Max 3 levels enforced at application layer

## Recent Changes

- 001-postman-core: Initial feature specification and plan
- Added TypeScript 5.x (strict mode)
- Added Deno 2.x backend with Hono
- Added React 18 + Vite frontend

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
