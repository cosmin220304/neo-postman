# Feature Specification: Neo-Postman Core

**Feature Branch**: `001-postman-core`  
**Created**: 2025-12-05  
**Status**: Draft  
**Input**: User description: "Create a simple but robust Postman clone in web, with environments, variables, request history/audit log, API templates + folders, team sync via project-name and password, authorization support (API keys, bearer tokens)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send an HTTP Request (Priority: P1)

As a developer, I want to construct and send HTTP requests so that I can test and debug APIs quickly.

**Why this priority**: This is the core functionality. Without the ability to send requests, the tool has no value. Everything else builds on top of this.

**Independent Test**: Can be fully tested by opening the app, entering a URL, selecting a method, and clicking Send. Delivers immediate value as a basic HTTP client.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** I enter a URL and click Send, **Then** I see the response body, status code, and response time
2. **Given** I have a request form, **When** I select POST method, **Then** I can add a request body in JSON, form-data, or raw text
3. **Given** I have a request form, **When** I add headers, **Then** they are included in the outgoing request
4. **Given** I send a request, **When** the server responds, **Then** I see response headers, body (formatted if JSON), status, and timing

---

### User Story 2 - Manage Environments and Variables (Priority: P2)

As a developer, I want to create environments (e.g., dev, staging, prod) with variables so that I can reuse the same requests across different configurations.

**Why this priority**: Variables make requests reusable. Without them, users must manually edit URLs and headers for each environment, which is error-prone and tedious.

**Independent Test**: Can be tested by creating an environment, defining a variable like `{{baseUrl}}`, using it in a request URL, switching environments, and verifying the variable resolves correctly.

**Acceptance Scenarios**:

1. **Given** I have no environments, **When** I create a new environment named "Development", **Then** it appears in my environment list
2. **Given** I have an environment, **When** I add a variable `baseUrl = http://localhost:3000`, **Then** I can use `{{baseUrl}}` in request URLs
3. **Given** I have multiple environments, **When** I switch from "Development" to "Production", **Then** all `{{variable}}` references resolve to Production values
4. **Given** I use `{{undefinedVar}}` in a request, **When** I send the request, **Then** I see a clear warning that the variable is undefined

---

### User Story 3 - Organize Requests in Collections and Folders (Priority: P3)

As a developer, I want to organize my requests into collections and folders so that I can manage large numbers of API endpoints efficiently.

**Why this priority**: Organization becomes critical as the number of requests grows. Collections enable sharing and team collaboration.

**Independent Test**: Can be tested by creating a collection, adding folders, saving requests to folders, and verifying the hierarchy displays correctly.

**Acceptance Scenarios**:

1. **Given** I have no collections, **When** I create a new collection named "User API", **Then** it appears in my sidebar
2. **Given** I have a collection, **When** I create a folder "Authentication" inside it, **Then** the folder appears nested under the collection
3. **Given** I have sent a request, **When** I click "Save to Collection", **Then** I can choose a collection and folder to save it to
4. **Given** I have saved requests, **When** I click on a saved request, **Then** it loads into the request builder ready to send

---

### User Story 4 - View Request History and Audit Log (Priority: P4)

As a developer, I want to see a history of all requests and responses so that I can audit API interactions and debug issues.

**Why this priority**: History provides traceability and helps with debugging. It's essential for audit purposes but not required for basic functionality.

**Independent Test**: Can be tested by sending several requests, opening the history panel, and verifying all requests appear with timestamps, status codes, and the ability to view full request/response details.

**Acceptance Scenarios**:

1. **Given** I send a request, **When** the response returns, **Then** the request-response pair is automatically saved to history
2. **Given** I have history entries, **When** I open the history panel, **Then** I see a chronological list with timestamp, method, URL, and status
3. **Given** I have history entries, **When** I click on an entry, **Then** I see the complete request (headers, body) and response (headers, body, timing)
4. **Given** I have many history entries, **When** I search or filter, **Then** I can find specific requests by URL, method, or status code

---

### User Story 5 - Add Authorization to Requests (Priority: P5)

As a developer, I want to easily add authorization (API keys, bearer tokens) to my requests so that I can test authenticated endpoints without manually constructing headers.

**Why this priority**: Most APIs require authentication. Built-in auth support reduces errors and improves developer experience.

**Independent Test**: Can be tested by selecting an auth type, entering credentials, sending a request, and verifying the correct header is added.

**Acceptance Scenarios**:

1. **Given** I am building a request, **When** I select "Bearer Token" auth and enter a token, **Then** an `Authorization: Bearer <token>` header is added
2. **Given** I am building a request, **When** I select "API Key" auth, **Then** I can specify the key name, value, and whether it goes in header or query params
3. **Given** I have set auth on a collection, **When** I send a request from that collection, **Then** the collection's auth is applied unless overridden
4. **Given** I use a variable like `{{apiKey}}` in auth, **When** I send the request, **Then** the variable is resolved from the active environment

---

### User Story 6 - Sync Data Across Teams (Priority: P6)

As a team lead, I want to share collections and environments with my team so that we can collaborate on API testing with consistent configurations.

**Why this priority**: Team collaboration is valuable but the app is fully functional for individual use without it. This is an enhancement for team scenarios.

**Independent Test**: Can be tested by creating a project, inviting a team member (via project name + password), making changes, and verifying the other user sees the updates.

**Acceptance Scenarios**:

1. **Given** I have collections, **When** I create a sync project with a name and password, **Then** my data is uploaded and accessible via those credentials
2. **Given** a project exists, **When** another user enters the project name and password, **Then** they can access and contribute to the shared collections
3. **Given** I am connected to a project, **When** another team member adds a request, **Then** I see the new request appear (after refresh or automatically)
4. **Given** I am offline, **When** I make changes, **Then** they sync when I reconnect

---

### Edge Cases

- What happens when a request times out? Show timeout error with elapsed time, allow retry
- What happens when the target server has CORS restrictions? All requests are routed through a built-in proxy service to bypass CORS
- What happens when a variable references another variable? Support nested variable resolution
- What happens when two team members edit the same request simultaneously? Last-write-wins with conflict notification
- What happens when the sync server is unavailable? Allow offline work, queue changes for sync
- What happens when a response body is very large (>10MB)? Truncate display with option to download full response
- What happens when JSON response is malformed? Show raw response with parse error indicator

## Requirements *(mandatory)*

### Functional Requirements

**Request Builder**
- **FR-001**: System MUST support HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **FR-002**: System MUST allow users to add, edit, and remove request headers
- **FR-003**: System MUST support request body types: JSON, form-data, x-www-form-urlencoded, raw text, binary file upload
- **FR-004**: System MUST display response status code, headers, body, and timing metrics
- **FR-005**: System MUST format JSON responses with syntax highlighting and collapsible sections
- **FR-005a**: System MUST apply a default request timeout of 30 seconds
- **FR-005b**: System MUST allow users to override the timeout per-request (0 = no timeout)
- **FR-005c**: System MUST route all HTTP requests through a backend proxy service to bypass browser CORS restrictions

**Environments & Variables**
- **FR-006**: System MUST allow users to create, edit, and delete environments
- **FR-007**: System MUST allow users to define key-value variables within each environment
- **FR-008**: System MUST resolve `{{variableName}}` syntax in URLs, headers, body, and auth fields
- **FR-009**: System MUST allow users to switch active environment via a dropdown/selector
- **FR-010**: System MUST indicate unresolved variables before sending a request

**Collections & Organization**
- **FR-011**: System MUST allow users to create, rename, and delete collections
- **FR-012**: System MUST allow users to create nested folders within collections (at least 3 levels deep)
- **FR-013**: System MUST allow users to save requests to a collection/folder
- **FR-014**: System MUST allow users to duplicate, move, and reorder requests and folders
- **FR-015**: System MUST persist collection structure across sessions

**History & Audit**
- **FR-016**: System MUST automatically log every request-response pair with timestamp
- **FR-017**: System MUST store complete request details (method, URL, headers, body, auth used)
- **FR-018**: System MUST store complete response details (status, headers, body, timing)
- **FR-019**: System MUST allow users to search and filter history by URL, method, status code, or date range
- **FR-020**: System MUST allow users to re-run a historical request or load it into the builder
- **FR-020a**: System MUST retain history entries indefinitely until user manually deletes them
- **FR-020b**: System MUST allow users to delete individual history entries or clear all history

**Authorization**
- **FR-021**: System MUST support Bearer Token authorization (adds `Authorization: Bearer <token>` header)
- **FR-022**: System MUST support API Key authorization (configurable key name, value, placement in header or query)
- **FR-023**: System MUST allow auth to be set at collection level and inherited by requests
- **FR-024**: System MUST allow request-level auth to override collection-level auth

**Team Sync**
- **FR-025**: System MUST allow users to create a sync project with a project name and password
- **FR-026**: System MUST allow users to join an existing project using project name and password
- **FR-027**: System MUST sync collections, folders, requests, and environments to the server
- **FR-028**: System MUST support offline usage with local persistence and sync on reconnection
- **FR-029**: System MUST NOT sync request history (history remains local per user)
- **FR-030**: System MUST grant all project members equal permissions (create, edit, delete any shared resource)

### Key Entities

- **Environment**: A named configuration containing a set of variables. Attributes: name, variables (key-value pairs), isActive
- **Variable**: A key-value pair within an environment. Supports string values. Used for substitution in requests
- **Collection**: A named container for organizing requests and folders. Can have collection-level auth settings
- **Folder**: A named container within a collection for grouping related requests. Can be nested
- **Request**: A saved HTTP request configuration. Attributes: name, method, URL, headers, body, auth settings, parent (collection or folder)
- **HistoryEntry**: An immutable record of a sent request and its response. Attributes: timestamp, request details, response details, duration
- **SyncProject**: A shared workspace identified by project name. Contains collections and environments shared among team members

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can send their first HTTP request within 30 seconds of opening the app
- **SC-002**: Users can create an environment and use a variable in a request within 2 minutes
- **SC-003**: Users can organize 50+ requests across collections and folders without performance degradation
- **SC-004**: Request history search returns results within 1 second for up to 10,000 entries
- **SC-005**: Response display renders within 500ms for responses up to 1MB
- **SC-006**: Team sync propagates changes to other connected users within 5 seconds
- **SC-007**: App remains fully functional offline (except sync features)
- **SC-008**: 90% of users successfully complete a request-send-view-response cycle on first attempt without documentation

## Clarifications

### Session 2025-12-05

- Q: History retention policy - how long should history entries be kept? → A: Keep all history forever (user manually deletes)
- Q: Sync project permissions model - do all users have equal permissions? → A: All users equal - anyone can create, edit, delete anything
- Q: Request timeout behavior - what is the default timeout and can users configure it? → A: 30 second default, user can override per-request
- Q: Variable sensitivity - should secrets be treated differently from regular variables? → A: No distinction - all variables treated the same
- Q: CORS handling strategy - how should the app handle browser CORS restrictions? → A: Built-in proxy service - all requests routed through backend

## Assumptions

- Users have basic familiarity with HTTP concepts (methods, headers, request/response)
- The app will be used primarily in modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Team sizes for sync projects are small to medium (2-20 users per project)
- Request bodies will typically be under 1MB; responses under 10MB
- Users will accept simple project-name + password authentication for team sync (no SSO/OAuth for team auth in v1)
- CORS limitations in browsers may require a proxy service for certain cross-origin requests
