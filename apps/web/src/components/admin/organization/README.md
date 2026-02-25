# Admin Organization Feature (UI Mock-First)

This module provides the frontend structure for organization management without real API integration yet.

## Goal

Implement full admin UX flow now (list/detail/create/edit/delete/restore/bulk) and switch data source later from mock provider to real API provider.

## Current architecture

- `models/`: feature types and input contracts.
- `services/`: provider interface + organization service facade.
- `mock/`: in-memory provider and mock data.
- `state/`: simple state container for loading/error/data flow.
- `pages/`: page-level orchestration functions.
- `components/`: UI model contracts (framework-agnostic placeholders).
- `mappers/`: mapping helpers for view model shaping.
- `validators/`: local validation helpers.
- `tests/`: mock provider behavior tests.

## Integration plan (next phase)

When backend dependencies are ready (`auth`, `system-settings`, `user-account`, `address`):

1. Implement `OrganizationApiProvider` that satisfies `IOrganizationProvider`.
2. Replace provider injection in `OrganizationService`.
3. Keep pages/components/state unchanged.

## Notes

- This structure mirrors backend organization layering where practical.
- Private endpoint headers/auth are intentionally deferred to integration phase.
