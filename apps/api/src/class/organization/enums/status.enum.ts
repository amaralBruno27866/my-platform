export enum OrganizationSttus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
  DELETED = 4,
}

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
