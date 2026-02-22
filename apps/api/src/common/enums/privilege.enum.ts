export enum Privilege {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  MASTER = 4,
}

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
