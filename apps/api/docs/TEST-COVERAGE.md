# Test Coverage Strategy

## Current Coverage (March 2026)

```
All files          |   95.86% |    83.33% |   98.19% |   95.81%
                   | Stmts    | Branch    | Funcs    | Lines
```

**110 tests passing** across 26 test files.

## Coverage Philosophy

We follow a **pragmatic approach** to test coverage that balances thoroughness with practical development velocity:

- **Statements/Lines/Functions: ≥90%** - Core functionality must be tested
- **Branches: ≥75%** - Focus on security-critical and business logic paths
- **100% on security modules** - Auth components (password, token, store, validators) have complete coverage

## Intentionally Untested Branches

Some code branches are intentionally not tested due to practical constraints. These are documented with `// istanbul ignore next` comments:

### 1. Environment Configuration (`src/config/env.ts`)
- **Branch Coverage: 45.83%**
- **Reason**: Dotenv cascade logic runs at module initialization, requires separate processes to test all paths
- **Mitigation**: Validated manually in dev/test/prod environments
- **Risk**: LOW - Works reliably across all environments

### 2. Auth Controllers - Defensive Code (`src/auth/controllers/controller.ts`)
- **Branch Coverage: 50%**
- **Reason**: `if (!accountId)` check is defensive programming; `requireAuth` middleware guarantees this value
- **Mitigation**: Middleware has 87.5% coverage and is thoroughly tested
- **Risk**: LOW - Redundant safety check

### 3. Organization Controllers - Rare Edge Cases (`src/class/organization/controllers/controller-organization.ts`)
- **Branch Coverage: 66.66%**
- **Reason**: `getPathParam` array handling is rare in Express routing
- **Mitigation**: Standard Express behavior, documented edge case
- **Risk**: LOW - Defensive programming for framework edge case

### 4. Test Infrastructure (`src/tests/mongo-memory.ts`)
- **Branch Coverage: 50%**
- **Reason**: Cleanup logic (`if (mongoServer)`) for test infrastructure
- **Mitigation**: Tested implicitly by all integration tests
- **Risk: NONE** - Test utility code

## Security-Critical Modules (100% Coverage)

These modules handle sensitive operations and have complete test coverage:

- ✅ `src/auth/password.ts` - Password hashing & verification
- ✅ `src/auth/token.ts` - JWT signing & verification
- ✅ `src/auth/store.ts` - Session management
- ✅ `src/auth/validators.ts` - Input validation
- ✅ `src/auth/errors.ts` - Error handling

## Business Logic Coverage

Organization module has strong functional coverage with pragmatic branch testing:

- Controllers: 91.3% statements, 66.66% branches
- Services: 93.38% statements, 77.27% branches
- Repository: 97.87% statements, 82.35% branches
- Validators: 91.17% statements, 77.77% branches

**Trade-off**: Some error handling branches require complex mocking. We test happy paths + common errors thoroughly.

## Running Coverage

```bash
# Full coverage report
npm run test:api:coverage

# Watch mode during development
npm run test:api

# CI/CD gates
npm run build:api  # Must succeed
npm run test:api   # All tests must pass
```

## Coverage Gates (vitest.config.ts)

```typescript
coverage: {
  thresholds: {
    statements: 90,
    branches: 75,    // Pragmatic threshold
    functions: 90,
    lines: 90
  }
}
```

## Future Improvements

When branch coverage becomes a priority:

1. Add integration tests with separate processes for `env.ts` config variations
2. Mock complex error scenarios in organization services
3. Test edge cases in validators with invalid data permutations

**Estimated effort**: 3-5 hours, ~50+ additional tests
**Expected outcome**: 92-95% branch coverage

---

**Last Updated**: March 8, 2026  
**Test Count**: 110 tests  
**Philosophy**: Pragmatic > Perfect
