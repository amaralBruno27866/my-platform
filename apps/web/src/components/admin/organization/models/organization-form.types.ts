import { OrganizationStatus } from "./organization.types";

export interface OrganizationCreateInput {
  organizationName: string;
  legalName: string;
  acronym: string;
  organizationLogo: string;
  organizationWebsite: string;
  representativeName: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
}

export interface OrganizationUpdateInput {
  organizationName?: string;
  legalName?: string;
  acronym?: string;
  slug?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
  representativeName?: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationStatus?: OrganizationStatus;
}

export interface OrganizationBulkStatusInput {
  applyToAll?: boolean;
  organizationIds?: string[];
  organizationStatus: OrganizationStatus;
  includeDeleted?: boolean;
}

export interface OrganizationBulkDeleteInput {
  applyToAll?: boolean;
  organizationIds?: string[];
  includeDeleted?: boolean;
}
