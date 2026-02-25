import { OrganizationView } from "../models";

export interface OrganizationTableProps {
  rows: OrganizationView[];
  loading?: boolean;
  onView?: (organizationId: string) => void;
  onEdit?: (organizationId: string) => void;
  onDelete?: (organizationId: string) => void;
}

export function createOrganizationTableModel(
  props: OrganizationTableProps,
): OrganizationTableProps {
  return props;
}
