# Quickstart: Neo-Postman

Get Neo-Postman running locally in under 5 minutes.

## Prerequisites

- **Node.js** 20+ (for frontend build tools)
- **Deno** 2.x (for backend)
- **pnpm** (recommended) or npm

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd neo-postman

# Install frontend dependencies
cd frontend
pnpm install

# Backend has no install step (Deno manages deps)
```

### 2. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
deno task dev
# Server runs at http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
# App runs at http://localhost:5173
```

### 3. Open the App

Navigate to [http://localhost:5173](http://localhost:5173)

## First Request

1. The app opens with an empty request builder
2. Enter a URL: `https://jsonplaceholder.typicode.com/posts/1`
3. Method is GET by default
4. Click **Send**
5. See the JSON response in the response panel

## Project Structure

```
neo-postman/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks
│   │   ├── stores/       # Zustand state stores
│   │   ├── services/     # API client, IndexedDB
│   │   └── types/        # TypeScript types
│   └── tests/
├── backend/           # Deno + Hono server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── db/           # SQLite setup
│   └── tests/
└── specs/             # Feature specifications
```

## Development Commands

### Frontend

```bash
cd frontend

pnpm dev          # Start dev server with HMR
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Run Vitest tests
pnpm test:e2e     # Run Playwright E2E tests
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript compiler
```

### Backend

```bash
cd backend

deno task dev     # Start dev server with watch mode
deno task start   # Start production server
deno task test    # Run tests
deno task lint    # Run linter
deno task fmt     # Format code
```

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000  # Backend URL
```

### Backend (environment or .env)

```bash
PORT=8000                    # Server port
DATABASE_PATH=./data/neo.db  # SQLite database path
JWT_SECRET=your-secret-here  # For sync project auth
```

## Key Features Walkthrough

### Environments & Variables

1. Click the environment dropdown (top right)
2. Click "Manage Environments"
3. Create a new environment: "Development"
4. Add a variable: `baseUrl` = `http://localhost:3000`
5. Use in requests: `{{baseUrl}}/api/users`

### Collections

1. Click "New Collection" in sidebar
2. Name it: "My API"
3. Right-click to add folders
4. Save requests to collections with Ctrl+S

### History

1. Send any request
2. Click "History" tab in sidebar
3. Click any entry to view full request/response
4. Click "Load" to restore request to builder

### Team Sync

1. Click the sync icon (top right)
2. Create a new project with name + password
3. Share credentials with team
4. Others join using the same name + password

## Testing

### Run All Tests

```bash
# Frontend unit tests
cd frontend && pnpm test

# Frontend E2E tests
cd frontend && pnpm test:e2e

# Backend tests
cd backend && deno task test
```

### Test a Specific Feature

```bash
# Frontend - test request builder
cd frontend && pnpm test src/components/request-builder

# Backend - test proxy
cd backend && deno test src/routes/proxy.test.ts
```

## Troubleshooting

### CORS Errors

All requests should go through the backend proxy. If you see CORS errors:
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in frontend .env

### IndexedDB Issues

Clear browser storage if data seems corrupted:
1. Open DevTools → Application → IndexedDB
2. Delete "neo-postman" database
3. Refresh the page

### Sync Not Working

1. Check backend logs for errors
2. Verify JWT_SECRET is set
3. Try creating a new project

## Next Steps

- Read the [full specification](./spec.md) for feature details
- Check [data-model.md](./data-model.md) for entity schemas
- See [api.yaml](./contracts/api.yaml) for API documentation
