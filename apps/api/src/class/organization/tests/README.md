# Organization Tests Guide

This folder contains the automated test strategy for the `organization` entity.

## Why this test suite exists

The `organization` entity is one of the core business entities in the API and includes:
- access control rules (privilege-based behavior)
- CRUD + soft-delete/restore lifecycle
- bulk operations
- input validation and normalization
- repository persistence behavior
- domain events
- error handling and HTTP mapping

The test suite is designed to reduce regressions in all these areas and give confidence for refactors.

## Test architecture

The strategy uses **three complementary layers**:

1. **Unit tests**
   - Validate pure logic and deterministic behavior.
   - Fast and isolated.
   - Examples: validators, rules, mappers, utility functions, enum helpers, error mapping.

2. **Integration tests**
   - Validate interaction between service/repository/schema layers with real Mongoose models.
   - Uses `mongodb-memory-server` for an isolated in-memory MongoDB.
   - Examples: repository and service command/lookup flows.

3. **E2E API tests**
   - Validate Express routes from request to response.
   - Checks status codes, payloads, and error mapping behavior.

This layered model catches issues earlier (unit), validates contracts between layers (integration), and verifies actual runtime behavior (e2e).

## Files and purpose

- `organization-errors.test.ts`
  - Verifies domain error mapping (`ZodError`, duplicate key, cast error, unknown errors).

- `organization-events.test.ts`
  - Verifies event bus behavior (`on`, `emit`, `off`).

- `organization-mappers.test.ts`
  - Verifies DTO ↔ persistence ↔ response mapping rules and ID conversions.

- `organization-repositories.test.ts`
  - Verifies Mongo operations (find/list/update/soft-delete/restore/bulk).
  - Includes `applyToAll`/`includeDeleted` behavior.

- `organization-rules.test.ts`
  - Verifies authorization matrix and editable/immutable field logic.

- `organization-services-command.test.ts`
  - Verifies command use-cases: create/update/delete/restore/bulk.
  - Covers positive and negative paths (forbidden/not-found/etc).

- `organization-services-lookup.test.ts`
  - Verifies read use-cases (get by id/slug/list) and permission constraints.

- `organization-utils.test.ts`
  - Verifies formatting, normalization, masking, hashing, and change-set logic.

- `organization-validators.test.ts`
  - Verifies create/update/query/bulk schemas and invalid payload behavior.

- `organization.e2e.test.ts`
  - Verifies HTTP routes and status mapping for success + error scenarios.

- `index.ts`
  - Internal barrel for test organization only.

## Test data and environment

Tests use:
- `src/tests/mongo-memory.ts` for in-memory Mongo lifecycle.
- `src/tests/setup.ts` for test environment bootstrap.

The in-memory database gives deterministic tests and avoids local/dev DB side effects.

## How to run

From repository root:

```bash
npm run -w apps/api test
npm run -w apps/api test:coverage
```

From `apps/api`:

```bash
npx vitest run
npx vitest run --coverage
```

## Coverage policy

Coverage is protected by gate in `apps/api/vitest.config.ts`:
- statements: `>= 90`
- branches: `>= 75`
- functions: `>= 90`
- lines: `>= 90`

If coverage falls below any threshold, CI fails.

## CI behavior

Workflow: `.github/workflows/api-ci.yml`

Pipeline includes:
1. dependency install
2. API build
3. test + coverage execution

This guarantees every PR/push keeps quality and coverage baseline.

## Practical guidance for future changes

When adding a new feature in `organization`, prefer this sequence:

1. Add/adjust unit tests for pure logic.
2. Add integration tests for persistence/service changes.
3. Add or update e2e tests for API behavior/status contracts.
4. Run coverage and ensure thresholds still pass.

When a bug is found, include at least one regression test reproducing that bug before/with the fix.
