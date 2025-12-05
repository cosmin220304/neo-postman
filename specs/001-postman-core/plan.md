# Implementation Plan: Neo-Postman Core

**Branch**: `001-postman-core` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-postman-core/spec.md`

## Summary

Build a web-based API client (Postman clone) with request builder, environments/variables, collections/folders, request history, authorization helpers, and team sync. The frontend is a React SPA communicating with a Deno backend that handles CORS proxying and team data synchronization.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**:
- Frontend: React 18, Vite, TanStack Query, Zustand, Tailwind CSS, Zod, Monaco Editor
- Backend: Deno 2.x, Hono (web framework), Zod  
**Storage**: 
- Frontend: IndexedDB (Dexie.js) for local persistence
- Backend: SQLite (via Deno) for sync server  
**Testing**: Vitest (unit/integration), Playwright (E2E)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- Request send-to-response display < 500ms overhead
- UI renders 50+ collection items without lag
- History search < 1s for 10,000 entries  
**Constraints**: 
- Offline-capable (IndexedDB)
- All API requests proxied through backend (CORS bypass)
- Response display truncated at 10MB  
**Scale/Scope**: 
- 2-20 users per sync project
- 1,000+ saved requests per user
- 10,000+ history entries  
**Design System**: Linear/Modern dark theme (see `ui-guidelines.md`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type Safety First | PASS | TypeScript strict mode, Zod for runtime validation, typed APIs |
| II. Documentation Standards | PASS | OpenAPI spec for backend, JSDoc required, AGENTS.md will be created |
| III. Code Quality Gates | PASS | ESLint + Prettier, Husky pre-commit, Vitest for tests |
| IV. Testing Standards | PASS | Vitest unit tests, Playwright E2E, contract tests for API |
| V. User Experience Consistency | PASS | Tailwind + component library, loading/error states specified |

## Project Structure

### Documentation (this feature)

```text
specs/001-postman-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
│   └── api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.ts              # Deno entry point
│   ├── routes/
│   │   ├── proxy.ts         # CORS proxy endpoint
│   │   └── sync.ts          # Team sync endpoints
│   ├── services/
│   │   ├── proxy.service.ts
│   │   └── sync.service.ts
│   ├── models/
│   │   └── schema.ts        # Zod schemas + DB types
│   └── db/
│       └── sqlite.ts        # SQLite connection
├── tests/
│   ├── proxy.test.ts
│   └── sync.test.ts
└── deno.json

frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── request-builder/
│   │   │   ├── RequestBuilder.tsx
│   │   │   ├── MethodSelector.tsx
│   │   │   ├── UrlBar.tsx
│   │   │   ├── HeadersEditor.tsx
│   │   │   ├── BodyEditor.tsx
│   │   │   └── AuthEditor.tsx
│   │   ├── response-viewer/
│   │   │   ├── ResponseViewer.tsx
│   │   │   ├── ResponseBody.tsx
│   │   │   └── ResponseHeaders.tsx
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CollectionTree.tsx
│   │   │   └── HistoryList.tsx
│   │   ├── environments/
│   │   │   ├── EnvironmentSelector.tsx
│   │   │   └── EnvironmentEditor.tsx
│   │   └── ui/                # Shared UI components
│   ├── hooks/
│   │   ├── useRequest.ts
│   │   ├── useEnvironments.ts
│   │   ├── useCollections.ts
│   │   ├── useHistory.ts
│   │   └── useSync.ts
│   ├── stores/
│   │   ├── request.store.ts
│   │   ├── environment.store.ts
│   │   ├── collection.store.ts
│   │   └── sync.store.ts
│   ├── services/
│   │   ├── api.ts            # Backend API client
│   │   ├── db.ts             # IndexedDB (Dexie)
│   │   └── variable-resolver.ts
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   └── lib/
│       └── utils.ts
├── tests/
│   ├── components/
│   ├── hooks/
│   └── e2e/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**Structure Decision**: Web application with separate frontend (React/Vite) and backend (Deno/Hono). Frontend handles UI and local persistence; backend handles CORS proxying and team sync storage.

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale |
|----------|-----------|
| Separate frontend/backend | Required for CORS proxy and team sync server |
| IndexedDB + SQLite | Local-first architecture; SQLite only for sync server |
| Zustand over Redux | Simpler state management, sufficient for this scope |
| Hono over Oak | Modern, fast, good TypeScript support |
