# User Account CRUD Notes

## Context

This module is being designed for a multi-tenant platform.

- Each organization will have its own database.
- Routing and access scope will be anchored to the organization context.
- `MASTER` is the platform super-admin.
- `HIGH` is the organization admin with broad powers inside the organization.
- `MEDIUM` is an intermediate administrative role.
- `LOW` is the common authenticated user, limited to their own account for simple updates.
- Public account creation happens through a public `POST` route.

Even with database isolation per organization, privilege escalation rules must still be enforced inside each tenant.

## Agreed Rules

### Public account creation

- The account creation route is public.
- Public users can provide standard registration fields such as name, email, phone, password, acceptance term, and account group.
- `Privilege` and `Access-modifier` are not informed by the public client.
- `Privilege` defaults to `LOW`.
- `Access-modifier` defaults to `PRIVATE`.
- `Organization` is system-managed from the organization context.

### Privilege model

- `MASTER` can manage all organizations.
- `HIGH` can manage users and internal settings of their own organization.
- `HIGH` must never be able to assign or reach `MASTER` privilege.
- `HIGH` must never manage users outside its organization.
- `LOW` can only edit simple fields of their own account.

### Account group model

- `Account-group` is not a global platform role.
- `Account-group` represents an organizational classification.
- Examples of public groups: `OT`, `OTA`, `Student`, `Vendor`, `Associate`, `Affiliate`.
- Examples of internal groups: `Staff 1`, `Staff 2`, `Staff 3`.
- Public registration should only expose groups explicitly allowed for self-registration.
- Administrative dashboards can expose internal groups to `HIGH` and `MASTER` users.
- `LOW` users should not be able to change their own group after account creation.

### Password model

- Password hashes must never be readable through API responses.
- Password changes and password recovery are valid flows.
- `LOW` can change their own password.
- `MEDIUM`, `HIGH`, and `MASTER` can reset passwords according to business rules.

### Acceptance term model

- `Acceptance-Term` is a historical/legal confirmation.
- It must be treated as immutable after creation.

## Current CSV Assessment

The current CSV now reflects the main decisions discussed for the entity.

### Confirmed alignments

- `Password.Read` is now `N/A (system)`.
- `Acceptance-Term.Update` is now `N/A (unchangeable)`.
- `Account-group.Immutable` is now `FALSE`.
- `Privilege.Create` and `Access-modifier.Create` are both `N/A (system)`.
- Public account creation remains limited to the fields expected from the public registration route.

### Remaining policy-sensitive areas

The CSV is now structurally coherent, but some permissions still require strict runtime enforcement.

#### 1. Privilege update requires tenant-scoped safeguards

Current CSV line:

- `Privilege` -> `Update = HIGH, MASTER`

This is acceptable only if the application enforces all of the following:

- `HIGH` cannot assign `MASTER`.
- `HIGH` cannot elevate themselves.
- `HIGH` cannot manage users outside their organization.
- `HIGH` can only assign privileges allowed by tenant policy.

#### 2. Access-modifier update follows the same restriction model

Current CSV line:

- `Access-modifier` -> `Update = HIGH, MASTER`

This is acceptable only if:

- changes are restricted to users within the same organization
- the platform defines which transitions are allowed for `HIGH`
- `HIGH` cannot use this field to bypass tenant isolation or internal platform rules

#### 3. Field-level delete values should be interpreted as record-level permission

Some rows use `Delete = HIGH, MASTER` even for immutable or system-managed fields.

Interpretation:

- this should be read as permission to delete the user record, not permission to mutate or delete the individual field itself

## Current Recommended State

Based on the latest CSV, these points are considered aligned:

- `Password.Read` -> `N/A (system)`
- `Acceptance-Term.Update` -> `N/A (unchangeable)`
- `Account-group.Immutable` -> `FALSE`
- `Privilege.Create` -> `N/A (system)`
- `Access-modifier.Create` -> `N/A (system)`

The following can remain as currently modeled, but must be enforced in code:

- `Privilege.Update` -> `HIGH, MASTER`
- `Access-modifier.Update` -> `HIGH, MASTER`

## Future Implementation Notes

When the `account-group` sub-entity is created, it should likely include fields such as:

- organization reference
- group name
- visibility flag for public registration
- self-registration allowance flag
- display order
- active/inactive state

This will allow the public route to expose only public groups while preserving internal-only groups for administrative use.

## Conclusion

The overall direction is coherent for a multi-tenant platform with isolated organization databases and organization-scoped routing.

At this stage, the CSV is in a good state for future implementation. The main remaining risks are no longer in the document itself, but in how the business rules are enforced in code:

- `HIGH` must remain tenant-scoped
- `HIGH` must never reach or assign `MASTER`
- `Access-modifier` changes must not bypass platform security rules
- public registration must expose only the account groups intended for self-registration