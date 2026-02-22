/**
 * Enum: OrganizationSttus
 * Objective: Define the possible lifecycle states for an organization entity.
 * Functionality: Provides standardized status values for business rules, persistence, and API responses.
 * Expected Result: Consistent organization state transitions across all layers.
 *
 * Workflow:
 * - ACTIVE: Organization is active and can operate normally
 * - INACTIVE: Organization is temporarily inactive
 * - SUSPENDED: Organization is blocked due to policy, billing, or administrative reasons
 * - DELETED: Organization is logically removed and should not appear in normal operations
 */
export enum OrganizationSttus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
  DELETED = 4,
}

/**
 * Helper function to get organization status display name
 * Used for UI rendering, logs, and API responses
 */
export function getOrganizationStatusName(status: OrganizationSttus): string {
  switch (status) {
    case OrganizationSttus.ACTIVE:
      return "Active";
    case OrganizationSttus.INACTIVE:
      return "Inactive";
    case OrganizationSttus.SUSPENDED:
      return "Suspended";
    case OrganizationSttus.DELETED:
      return "Deleted";
    default:
      return "Unknown";
  }
}
