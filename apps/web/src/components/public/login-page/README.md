# Public Login Page Feature (UI Mock-First)

This module provides the frontend structure for public login flow without real API integration yet.

## Goal

Implement login UX now (validate input, submit, loading/error/session state) and switch data source later from mock provider to real API provider.

## Current architecture

- `models/`: feature types and input contracts.
- `services/`: provider interface + login service facade.
- `mock/`: in-memory provider and mock credentials.
- `state/`: simple state container for loading/error/session flow.
- `pages/`: page-level orchestration functions.
- `components/`: UI model contracts (framework-agnostic placeholders).
- `validators/`: local validation helpers.
- `tests/`: service/state/pages/components/validators/barrels tests.

## Integration plan (next phase)

1. Implement `LoginApiProvider` that satisfies `ILoginProvider`.
2. Replace provider injection in `LoginService`.
3. Keep pages/components/state unchanged.
