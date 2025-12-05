# Tasks: Neo-Postman Core

**Input**: Design documents from `/specs/001-postman-core/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml, ui-guidelines.md
**Design System**: See `prompt-for-fe.md` and `ui-guidelines.md` for all UI component styling

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create monorepo structure with frontend/ and backend/ directories
- [x] T002 [P] Initialize frontend with Vite + React + TypeScript in frontend/
- [x] T003 [P] Initialize backend with Deno + Hono in backend/
- [x] T004 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [x] T005 [P] Configure ESLint + Prettier in frontend/.eslintrc.cjs and frontend/.prettierrc
- [x] T006 [P] Configure Tailwind CSS with design tokens (colors, shadows, animations) in frontend/tailwind.config.ts per ui-guidelines.md
- [x] T007 [P] Setup Vitest in frontend/vite.config.ts
- [x] T008 [P] Create deno.json with tasks (dev, test, lint) in backend/deno.json
- [x] T009 Create shared Zod schemas in frontend/src/types/schemas.ts
- [x] T010 [P] Create TypeScript types from schemas in frontend/src/types/index.ts
- [x] T011 [P] Setup Husky pre-commit hooks in .husky/pre-commit

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Setup IndexedDB with Dexie in frontend/src/services/db.ts
- [ ] T013 Create database schema (environments, collections, folders, requests, history tables) in frontend/src/services/db.ts
- [ ] T014 [P] Create base UI components (Button, Input, Select, Tabs) in frontend/src/components/ui/ per ui-guidelines.md
- [ ] T015 [P] Setup Zustand store boilerplate in frontend/src/stores/
- [ ] T016 [P] Create API client service in frontend/src/services/api.ts
- [ ] T017 [P] Setup Hono app with CORS and JSON middleware in backend/src/main.ts
- [ ] T018 [P] Create health check endpoint in backend/src/routes/health.ts
- [ ] T019 Setup backend Zod schemas in backend/src/models/schema.ts
- [ ] T020 Create main App layout with sidebar + main panel in frontend/src/App.tsx per ui-guidelines.md layout spec

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send HTTP Request (Priority: P1)

**Goal**: Users can construct and send HTTP requests, view responses with status, headers, body, and timing

**Independent Test**: Open app, enter URL, click Send, see formatted response

### Backend (Proxy Service)

- [ ] T021 [US1] Create proxy route handler in backend/src/routes/proxy.ts
- [ ] T022 [US1] Implement proxy service with fetch + timeout in backend/src/services/proxy.service.ts
- [ ] T023 [US1] Add timing measurement (total, firstByte) in backend/src/services/proxy.service.ts
- [ ] T024 [US1] Handle large responses (truncate at 10MB) in backend/src/services/proxy.service.ts
- [ ] T025 [US1] Add error handling (timeout, network, DNS errors) in backend/src/services/proxy.service.ts

### Frontend (Request Builder)

- [ ] T026 [US1] Create request store with method, URL, headers, body state in frontend/src/stores/request.store.ts
- [ ] T027 [US1] Create MethodSelector component (GET, POST, etc.) in frontend/src/components/request-builder/MethodSelector.tsx
- [ ] T028 [US1] Create UrlBar component with input in frontend/src/components/request-builder/UrlBar.tsx
- [ ] T029 [US1] Create HeadersEditor component (add/edit/remove/toggle) in frontend/src/components/request-builder/HeadersEditor.tsx
- [ ] T030 [US1] Create BodyEditor component with type selector (JSON, form-data, raw) in frontend/src/components/request-builder/BodyEditor.tsx
- [ ] T031 [US1] Integrate Monaco Editor for JSON body in frontend/src/components/request-builder/BodyEditor.tsx
- [ ] T032 [US1] Create RequestBuilder container component with card styling and spotlight effect in frontend/src/components/request-builder/RequestBuilder.tsx per ui-guidelines.md
- [ ] T033 [US1] Create useRequest hook (send via proxy, handle response) in frontend/src/hooks/useRequest.ts

### Frontend (Response Viewer)

- [ ] T034 [US1] Create ResponseViewer container with card styling, loading/error states in frontend/src/components/response-viewer/ResponseViewer.tsx per ui-guidelines.md
- [ ] T035 [US1] Create ResponseStatus component (status code, time, size) in frontend/src/components/response-viewer/ResponseStatus.tsx
- [ ] T036 [US1] Create ResponseHeaders component in frontend/src/components/response-viewer/ResponseHeaders.tsx
- [ ] T037 [US1] Create ResponseBody component with JSON formatting in frontend/src/components/response-viewer/ResponseBody.tsx
- [ ] T038 [US1] Add loading state during request in frontend/src/components/response-viewer/ResponseViewer.tsx
- [ ] T039 [US1] Add error state display for failed requests in frontend/src/components/response-viewer/ResponseViewer.tsx

**Checkpoint**: User Story 1 complete - basic HTTP client functional

---

## Phase 4: User Story 2 - Environments and Variables (Priority: P2)

**Goal**: Users can create environments with variables, use {{variable}} syntax, switch environments

**Independent Test**: Create environment, add variable, use in URL, switch environments, verify resolution

### Data Layer

- [ ] T040 [US2] Create environment store in frontend/src/stores/environment.store.ts
- [ ] T041 [US2] Implement environment CRUD in IndexedDB in frontend/src/services/db.ts
- [ ] T042 [US2] Create variable resolver service in frontend/src/services/variable-resolver.ts
- [ ] T043 [US2] Support nested variable resolution ({{base}}/{{path}}) in frontend/src/services/variable-resolver.ts

### UI Components

- [ ] T044 [US2] Create EnvironmentSelector dropdown in frontend/src/components/environments/EnvironmentSelector.tsx
- [ ] T045 [US2] Create EnvironmentEditor modal/panel in frontend/src/components/environments/EnvironmentEditor.tsx
- [ ] T046 [US2] Create VariableList component (add/edit/delete/toggle) in frontend/src/components/environments/VariableList.tsx
- [ ] T047 [US2] Create useEnvironments hook in frontend/src/hooks/useEnvironments.ts

### Integration

- [ ] T048 [US2] Integrate variable resolution in useRequest hook in frontend/src/hooks/useRequest.ts
- [ ] T049 [US2] Add unresolved variable warning in UrlBar in frontend/src/components/request-builder/UrlBar.tsx
- [ ] T050 [US2] Highlight {{variables}} in URL/headers/body editors in frontend/src/components/request-builder/

**Checkpoint**: User Story 2 complete - environments and variables working

---

## Phase 5: User Story 3 - Collections and Folders (Priority: P3)

**Goal**: Users can organize requests in collections and nested folders, save/load requests

**Independent Test**: Create collection, add folder, save request, click to load into builder

### Data Layer

- [ ] T051 [US3] Create collection store in frontend/src/stores/collection.store.ts
- [ ] T052 [US3] Implement collection CRUD in IndexedDB in frontend/src/services/db.ts
- [ ] T053 [US3] Implement folder CRUD in IndexedDB in frontend/src/services/db.ts
- [ ] T054 [US3] Implement saved request CRUD in IndexedDB in frontend/src/services/db.ts
- [ ] T055 [US3] Enforce max folder nesting depth (3 levels) in frontend/src/services/db.ts

### UI Components

- [ ] T056 [US3] Create Sidebar container with tabs (Collections, History) in frontend/src/components/sidebar/Sidebar.tsx
- [ ] T057 [US3] Create CollectionTree component (recursive tree view) in frontend/src/components/sidebar/CollectionTree.tsx
- [ ] T058 [US3] Create CollectionItem component with context menu in frontend/src/components/sidebar/CollectionItem.tsx
- [ ] T059 [US3] Create FolderItem component with expand/collapse in frontend/src/components/sidebar/FolderItem.tsx
- [ ] T060 [US3] Create RequestItem component in frontend/src/components/sidebar/RequestItem.tsx
- [ ] T061 [US3] Create SaveRequestModal (pick collection/folder, enter name) in frontend/src/components/sidebar/SaveRequestModal.tsx
- [ ] T062 [US3] Create useCollections hook in frontend/src/hooks/useCollections.ts

### Integration

- [ ] T063 [US3] Add "Save to Collection" button in RequestBuilder in frontend/src/components/request-builder/RequestBuilder.tsx
- [ ] T064 [US3] Load saved request into builder on click in frontend/src/components/sidebar/RequestItem.tsx
- [ ] T065 [US3] Implement drag-and-drop reordering in CollectionTree in frontend/src/components/sidebar/CollectionTree.tsx

**Checkpoint**: User Story 3 complete - collections and organization working

---

## Phase 6: User Story 4 - Request History (Priority: P4)

**Goal**: Users can view history of all requests/responses, search and filter, re-run requests

**Independent Test**: Send requests, open history, see entries, click to view details, search

### Data Layer

- [ ] T066 [US4] Implement history entry creation on request send in frontend/src/hooks/useRequest.ts
- [ ] T067 [US4] Implement history search/filter in IndexedDB in frontend/src/services/db.ts
- [ ] T068 [US4] Implement history deletion (single + clear all) in frontend/src/services/db.ts

### UI Components

- [ ] T069 [US4] Create HistoryList component in frontend/src/components/sidebar/HistoryList.tsx
- [ ] T070 [US4] Create HistoryItem component (method, URL, status, time) in frontend/src/components/sidebar/HistoryItem.tsx
- [ ] T071 [US4] Create HistoryDetail modal/panel (full request + response) in frontend/src/components/sidebar/HistoryDetail.tsx
- [ ] T072 [US4] Create HistorySearch component (URL, method, status filters) in frontend/src/components/sidebar/HistorySearch.tsx
- [ ] T073 [US4] Create useHistory hook in frontend/src/hooks/useHistory.ts

### Integration

- [ ] T074 [US4] Add "Load to Builder" action from history in frontend/src/components/sidebar/HistoryItem.tsx
- [ ] T075 [US4] Add "Re-run" action from history in frontend/src/components/sidebar/HistoryItem.tsx

**Checkpoint**: User Story 4 complete - history and audit working

---

## Phase 7: User Story 5 - Authorization (Priority: P5)

**Goal**: Users can add Bearer Token or API Key auth, inherit from collection, override per-request

**Independent Test**: Select auth type, enter credentials, send request, verify header added

### UI Components

- [ ] T076 [US5] Create AuthEditor component in frontend/src/components/request-builder/AuthEditor.tsx
- [ ] T077 [US5] Create BearerTokenAuth subcomponent in frontend/src/components/request-builder/auth/BearerTokenAuth.tsx
- [ ] T078 [US5] Create ApiKeyAuth subcomponent in frontend/src/components/request-builder/auth/ApiKeyAuth.tsx
- [ ] T079 [US5] Add auth tab to RequestBuilder in frontend/src/components/request-builder/RequestBuilder.tsx

### Integration

- [ ] T080 [US5] Add auth config to collection schema in frontend/src/services/db.ts
- [ ] T081 [US5] Implement auth inheritance (collection → folder → request) in frontend/src/hooks/useRequest.ts
- [ ] T082 [US5] Apply auth headers before sending request in frontend/src/hooks/useRequest.ts
- [ ] T083 [US5] Support variables in auth fields ({{token}}) in frontend/src/services/variable-resolver.ts

**Checkpoint**: User Story 5 complete - authorization working

---

## Phase 8: User Story 6 - Team Sync (Priority: P6)

**Goal**: Users can create/join sync projects, share collections and environments with team

**Independent Test**: Create project, join from another browser, make changes, see updates

### Backend (Sync Service)

- [ ] T084 [US6] Setup SQLite database in backend/src/db/sqlite.ts
- [ ] T085 [US6] Create sync project table schema in backend/src/db/sqlite.ts
- [ ] T086 [US6] Create sync changes table schema in backend/src/db/sqlite.ts
- [ ] T087 [US6] Implement JWT auth for projects in backend/src/services/auth.service.ts
- [ ] T088 [US6] Create project routes (create, join) in backend/src/routes/sync.ts
- [ ] T089 [US6] Implement create project endpoint in backend/src/services/sync.service.ts
- [ ] T090 [US6] Implement join project endpoint in backend/src/services/sync.service.ts
- [ ] T091 [US6] Implement get changes endpoint in backend/src/services/sync.service.ts
- [ ] T092 [US6] Implement push changes endpoint in backend/src/services/sync.service.ts
- [ ] T093 [US6] Implement get snapshot endpoint in backend/src/services/sync.service.ts

### Frontend (Sync Client)

- [ ] T094 [US6] Create sync store in frontend/src/stores/sync.store.ts
- [ ] T095 [US6] Create useSync hook with polling in frontend/src/hooks/useSync.ts
- [ ] T096 [US6] Implement offline change queue in frontend/src/services/sync-queue.ts
- [ ] T097 [US6] Create SyncStatus indicator component in frontend/src/components/sync/SyncStatus.tsx
- [ ] T098 [US6] Create JoinProjectModal in frontend/src/components/sync/JoinProjectModal.tsx
- [ ] T099 [US6] Create CreateProjectModal in frontend/src/components/sync/CreateProjectModal.tsx

### Integration

- [ ] T100 [US6] Track changes on collection/folder/request/environment updates in frontend/src/stores/
- [ ] T101 [US6] Merge remote changes into local state in frontend/src/hooks/useSync.ts
- [ ] T102 [US6] Handle conflict notification (last-write-wins) in frontend/src/hooks/useSync.ts

**Checkpoint**: User Story 6 complete - team sync working

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T103 [P] Add keyboard shortcuts (Ctrl+Enter to send, Ctrl+S to save) in frontend/src/App.tsx
- [ ] T104 [P] Add loading spinners for all async operations in frontend/src/components/ui/
- [ ] T105 [P] Add error toasts/notifications in frontend/src/components/ui/Toast.tsx
- [ ] T106 [P] Add request timeout configuration UI in frontend/src/components/request-builder/RequestBuilder.tsx
- [ ] T107 [P] Add response body download option for large responses in frontend/src/components/response-viewer/ResponseBody.tsx
- [ ] T108 [P] Add dark mode support in frontend/src/App.tsx and frontend/tailwind.config.ts
- [ ] T109 Run quickstart.md validation
- [ ] T110 Update AGENTS.md with final implementation details

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3-8 (User Stories)**: All depend on Phase 2 completion
  - US1 can start after Phase 2
  - US2 can start after Phase 2 (parallel with US1 if staffed)
  - US3 depends on US1 (needs request builder)
  - US4 depends on US1 (needs request sending to create history)
  - US5 can start after Phase 2 (parallel)
  - US6 can start after Phase 2 (parallel for backend), needs US2+US3 for full integration
- **Phase 9 (Polish)**: Depends on all user stories complete

### Recommended Execution Order (Solo Developer)

1. Phase 1: Setup (T001-T011)
2. Phase 2: Foundational (T012-T020)
3. Phase 3: US1 - Send Request (T021-T039) ← **MVP**
4. Phase 4: US2 - Environments (T040-T050)
5. Phase 5: US3 - Collections (T051-T065)
6. Phase 6: US4 - History (T066-T075)
7. Phase 7: US5 - Authorization (T076-T083)
8. Phase 8: US6 - Team Sync (T084-T102)
9. Phase 9: Polish (T103-T110)

### Parallel Opportunities

**Within Phase 1:**
```
T002, T003 (frontend + backend init)
T004, T005, T006, T007, T008 (config files)
T009 → T010 (schemas → types)
```

**Within Phase 2:**
```
T014, T015, T016, T017, T018 (independent components)
```

**Within Phase 3 (US1):**
```
T021-T025 (backend) || T026-T033 (frontend request)
T034-T039 (frontend response) after T026
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test request builder independently
5. Deploy/demo as basic HTTP client

### Incremental Delivery

| Milestone | User Stories | Value Delivered |
|-----------|--------------|-----------------|
| MVP | US1 | Basic HTTP client |
| Alpha | US1 + US2 | Variables and environments |
| Beta | US1-US4 | Full local functionality |
| v1.0 | US1-US6 | Team sync, production ready |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Backend tasks for US1 can run parallel to frontend tasks
- History (US4) auto-saves entries when requests are sent in US1
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
