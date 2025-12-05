<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0 (Initial constitution)
  
  Modified principles: N/A (new document)
  
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack
    - Development Workflow
    - Governance
  
  Removed sections: N/A
  
  Templates status:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md ✅ compatible (user stories + requirements aligned)
    - .specify/templates/tasks-template.md ✅ compatible (test-first workflow supported)
  
  Follow-up TODOs: None
-->

# Neo-Postman Constitution

## Core Principles

### I. Type Safety First

All code MUST be written in TypeScript with strict type checking enabled. Type safety is non-negotiable and serves as the foundation for code reliability and developer experience.

**Rules**:
- `strict: true` MUST be enabled in all `tsconfig.json` files
- The `any` type is FORBIDDEN except when interfacing with untyped third-party libraries (must be documented with `// @ts-expect-error` or wrapped in typed adapters)
- All function parameters and return types MUST be explicitly typed
- Generic types MUST be used over `unknown` casts where applicable
- API responses MUST be validated at runtime using schema validation (e.g., Zod, io-ts)
- Database queries MUST use typed ORMs or query builders with generated types

**Rationale**: Type safety catches errors at compile time, improves IDE support, enables confident refactoring, and serves as living documentation. A Postman-like tool handles complex API structures where type errors would cause subtle, hard-to-debug issues.

### II. Documentation Standards

Documentation is a first-class deliverable. Every feature MUST include both human documentation and AI agent guidance.

**Rules**:
- All public APIs, components, and utilities MUST have JSDoc comments with `@param`, `@returns`, and `@example` tags
- Complex business logic MUST include inline comments explaining the "why"
- An `AGENTS.md` file MUST exist at repository root and be updated for each feature, containing:
  - Project architecture overview
  - Key file locations and their purposes
  - Common patterns and conventions used
  - Testing strategies and how to run tests
  - Known gotchas and edge cases
- README MUST include: quick start, development setup, architecture overview, and contribution guide
- API endpoints MUST be documented with OpenAPI/Swagger specifications

**Rationale**: Documentation enables onboarding, reduces tribal knowledge, and crucially enables AI coding assistants to understand and contribute to the codebase effectively. The AGENTS.md file is specifically designed for AI agent consumption.

### III. Code Quality Gates

Code quality is enforced through automated tooling and mandatory review processes. No code reaches production without passing quality gates.

**Rules**:
- ESLint MUST be configured with strict rules and zero warnings policy
- Prettier MUST be used for consistent formatting (no style debates in reviews)
- Pre-commit hooks MUST run linting and type checking
- All PRs MUST pass CI checks before merge (lint, type-check, tests, build)
- All PRs MUST receive at least one approval from a code owner
- Code complexity MUST be monitored (cyclomatic complexity < 10 per function)
- No `console.log` in production code (use structured logging)
- Dead code and unused dependencies MUST be removed before merge

**Rationale**: Automated quality gates catch issues early, reduce review burden, and maintain consistent standards across the codebase. This is especially important for a personal project that may have gaps between active development periods.

### IV. Testing Standards

Testing ensures reliability and enables confident refactoring. Tests are required for all business logic and user-facing features.

**Rules**:
- Unit test coverage MUST be maintained at minimum 80% for business logic
- Critical user paths MUST have end-to-end tests
- Test files MUST be co-located with source files (`*.test.ts` or `*.spec.ts`)
- Tests MUST follow the Arrange-Act-Assert pattern
- Mocking MUST be minimized; prefer integration tests with real dependencies where practical
- API endpoints MUST have contract tests validating request/response schemas
- Tests MUST be deterministic (no flaky tests allowed in CI)
- New features SHOULD follow test-first development when acceptance criteria are clear

**Rationale**: A Postman-like application handles complex HTTP interactions, authentication flows, and data transformations. Comprehensive testing prevents regressions and validates that the tool behaves correctly across diverse API scenarios.

### V. User Experience Consistency

The user interface MUST be consistent, accessible, and responsive. User experience is a product differentiator.

**Rules**:
- A design system/component library MUST be used for all UI elements
- Components MUST be accessible (WCAG 2.1 AA compliance minimum)
- All interactive elements MUST have visible focus states
- Loading states MUST be shown for async operations (no blank screens)
- Error states MUST be user-friendly with actionable guidance
- The UI MUST be responsive and functional on viewport widths 320px to 2560px
- Keyboard navigation MUST be supported for all critical workflows
- Color MUST NOT be the only means of conveying information
- UI patterns MUST be consistent (same action = same interaction pattern)

**Rationale**: As a personal Postman alternative, the tool will be used daily. Poor UX creates friction and erodes trust. Accessibility ensures the tool is usable in all contexts and by all users.

## Technology Stack

**Frontend**:
- TypeScript (strict mode)
- React or similar component framework
- Tailwind CSS or CSS-in-JS with design tokens
- Zod or similar for runtime validation

**Backend** (if applicable):
- TypeScript (strict mode)
- Node.js runtime
- Typed ORM for database access

**Tooling**:
- ESLint + Prettier for code quality
- Vitest or Jest for testing
- Playwright or Cypress for E2E tests
- Husky for git hooks

## Development Workflow

### Branch Strategy
- `main` branch is protected and always deployable
- Feature branches follow pattern: `<issue-number>-<brief-description>`
- All changes go through pull requests

### PR Requirements
1. Passing CI (lint, type-check, tests, build)
2. Updated documentation (including AGENTS.md if architecture changes)
3. Updated/added tests for new functionality
4. Self-review checklist completed

### Commit Standards
- Conventional commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Commits SHOULD be atomic and focused

## Governance

This constitution is the authoritative source for project standards. All contributions MUST comply with these principles.

**Amendment Process**:
1. Propose changes via PR to this document
2. Document rationale for the change
3. Update affected templates and documentation
4. Version bump follows semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or significant expansion
   - PATCH: Clarifications and refinements

**Compliance**:
- All PRs MUST be checked against constitution principles
- Violations require explicit justification and documentation
- Repeated violations warrant constitution review (is the rule practical?)

**Version**: 1.0.0 | **Ratified**: 2025-12-05 | **Last Amended**: 2025-12-05
