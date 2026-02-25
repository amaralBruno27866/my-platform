import { OrganizationStatus } from "../models/organization.types";

export interface OrganizationBulkActionsProps {
  selectedIds: string[];
  onBulkUpdateStatus: (organizationStatus: OrganizationStatus) => Promise<void>;
  onBulkSoftDelete: () => Promise<void>;
  disabled?: boolean;
}

export function createOrganizationBulkActionsModel(
  props: OrganizationBulkActionsProps,
): OrganizationBulkActionsProps {
  return props;
}
