import {
  OrganizationCreateInput,
  OrganizationStatus,
  OrganizationView,
} from "../models";

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function mapCreateInputToOrganizationView(
  input: OrganizationCreateInput,
  sequence: number,
): OrganizationView {
  const now = new Date().toISOString();

  return {
    organizationId: `mock-org-id-${sequence}`,
    organizationPublicId: `ORG-${String(sequence).padStart(6, "0")}`,
    organizationName: input.organizationName,
    legalName: input.legalName,
    acronym: input.acronym,
    slug: toSlug(input.organizationName),
    organizationLogo: input.organizationLogo,
    organizationWebsite: input.organizationWebsite,
    representativeName: input.representativeName,
    representativeAccountId: input.representativeAccountId,
    organizationEmail: input.organizationEmail,
    organizationAddress: input.organizationAddress,
    organizationPhone: input.organizationPhone,
    organizationStatus: OrganizationStatus.ACTIVE,
    privilege: 4,
    accessModifier: 3,
    createdBy: "mock-admin-account",
    updatedBy: "mock-admin-account",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}
