import { OrganizationView } from "../models/organization.types";

export interface OrganizationDetailModalProps {
  open: boolean;
  organization?: OrganizationView;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onEdit?: (organizationId: string) => void;
}

export function createOrganizationDetailModalModel(
  props: OrganizationDetailModalProps,
): OrganizationDetailModalProps {
  return props;
}
