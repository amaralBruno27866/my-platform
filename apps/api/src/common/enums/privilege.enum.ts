/**
 * Enum: Privilege
 * Objective: Define privilege levels for authorization and role-based decisions.
 * Functionality: Provides a shared privilege scale used by access rules.
 * Expected Result: Predictable permission checks and consistent policy enforcement.
 *
 * Workflow:
 * - LOW: Basic access level
 * - MEDIUM: Intermediate access level
 * - HIGH: Elevated access level
 * - MASTER: Full administrative access level
 */
export enum Privilege {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  MASTER = 4,
}

/**
 * Helper function to get privilege display name
 * Used for UI rendering, auditing, and API responses
 */
export function getPrivilegeName(privilege: Privilege): string {
  switch (privilege) {
    case Privilege.LOW:
      return "Low";
    case Privilege.MEDIUM:
      return "Medium";
    case Privilege.HIGH:
      return "High";
    case Privilege.MASTER:
      return "Master";
    default:
      return "Unknown";
  }
}
