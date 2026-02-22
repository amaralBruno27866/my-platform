/**
 * Enum: AccessModifier
 * Objective: Define visibility levels for class members and internal APIs.
 * Functionality: Standardizes access control semantics used in shared modules.
 * Expected Result: Consistent understanding of visibility constraints across the codebase.
 *
 * Workflow:
 * - PUBLIC: Accessible from anywhere
 * - PROTECTED: Accessible in the class and derived classes
 * - PRIVATE: Accessible only inside the declaring class
 */
export enum AccessModifier {
  PUBLIC = 1,
  PROTECTED = 2,
  PRIVATE = 3,
}

/**
 * Helper function to get access modifier display name
 * Used for logs, metadata visualization, and diagnostics
 */
export function getAccessModifierName(accessModifier: AccessModifier): string {
  switch (accessModifier) {
    case AccessModifier.PUBLIC:
      return "Public";
    case AccessModifier.PROTECTED:
      return "Protected";
    case AccessModifier.PRIVATE:
      return "Private";
    default:
      return "Unknown";
  }
}
