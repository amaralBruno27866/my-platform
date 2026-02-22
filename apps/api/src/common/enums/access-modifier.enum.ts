export enum AccessModifier {
  PUBLIC = 1,
  PROTECTED = 2,
  PRIVATE = 3,
}

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
