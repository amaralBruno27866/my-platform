import { OrganizationSttus } from "../enums";
import { AccessModifier, Privilege } from "../../../common/enums";

/**
 * Organization entity fixed metadata.
 */
export const ORGANIZATION_COLLECTION = "organization";
export const ORGANIZATION_BUSINESS_NAME = "My-organization";

/**
 * Prefix used to generate organization business IDs.
 * This prefix is entity-based (ORG), not organization acronym-based.
 * Example: ORG-000001
 */
export const ORGANIZATION_PUBLIC_ID_PREFIX = "ORG";

/**
 * Formatting constants for business ID generation.
 */
export const ORGANIZATION_PUBLIC_ID_SEPARATOR = "-";
export const ORGANIZATION_PUBLIC_ID_PAD_LENGTH = 6;

/**
 * Organization default values aligned with Organization-Schema.csv.
 */
export const ORGANIZATION_DEFAULTS = {
  status: OrganizationSttus.ACTIVE,
  privilege: Privilege.MASTER,
  accessModifier: AccessModifier.PRIVATE,
} as const;

/**
 * Fields that must never be edited after creation.
 */
export const ORGANIZATION_IMMUTABLE_FIELDS = [
  "organizationId",
  "organizationPublicId",
  "createdBy",
] as const;

/**
 * Fields editable only by users with privilege level 4.
 */
export const ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS = [
  "organizationName",
  "legalName",
  "acronym",
  "slug",
  "organizationLogo",
  "organizationWebsite",
  "representativeName",
  "representativeAccountId",
  "organizationEmail",
  "organizationAddress",
  "organizationPhone",
] as const;

/**
 * Queryable fields that are expected to be used in search/filter operations.
 */
export const ORGANIZATION_QUERY_FIELDS = [
  "organizationId",
  "organizationPublicId",
  "organizationName",
  "legalName",
  "slug",
  "representativeAccountId",
  "organizationEmail",
  "organizationStatus",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "createdBy",
  "updatedBy",
] as const;

/**
 * Soft-delete flags and lifecycle helpers.
 */
export const ORGANIZATION_SOFT_DELETE = {
  deletedAtField: "deletedAt",
  activeFilter: { deletedAt: null },
} as const;
