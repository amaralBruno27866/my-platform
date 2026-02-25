export enum OrganizationStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
  DELETED = 4,
}

export interface OrganizationView {
  organizationId: string;
  organizationPublicId: string;
  organizationName: string;
  legalName: string;
  acronym: string;
  slug: string;
  organizationLogo: string;
  organizationWebsite: string;
  representativeName: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationStatus: OrganizationStatus;
  privilege: number;
  accessModifier: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface OrganizationListResult {
  data: OrganizationView[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationListQuery {
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
  includeDeleted?: boolean;
}

export interface OrganizationBulkResult {
  matchedCount: number;
  modifiedCount: number;
}
