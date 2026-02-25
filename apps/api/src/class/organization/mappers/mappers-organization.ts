import { Types } from "mongoose";
import { AccessModifier, Privilege } from "../../../common/enums";
import { ORGANIZATION_DEFAULTS } from "../constants";
import { OrganizationSttus } from "../enums";
import {
  IOrganizationCreateDTO,
  IOrganizationInternal,
  IOrganizationResponseDTO,
  IOrganizationUpdateDTO,
} from "../interfaces";

export interface OrganizationCreateMapperOptions {
  createdBy: Types.ObjectId | string;
  organizationPublicId: string;
  organizationId?: Types.ObjectId | string;
  slug?: string;
  organizationStatus?: OrganizationSttus;
  privilege?: Privilege;
  accessModifier?: AccessModifier;
}

export interface OrganizationUpdateMapperOptions {
  updatedBy?: Types.ObjectId | string;
}

function toObjectIdOrUndefined(value?: string): Types.ObjectId | undefined {
  if (!value) {
    return undefined;
  }

  return new Types.ObjectId(value);
}

function toStringId(
  value?: Types.ObjectId | string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? value : value.toString();
}

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Mapper: create DTO -> persistence payload
 * Objective: transform client input into a schema-ready object.
 */
export function mapOrganizationCreateToPersistence(
  input: IOrganizationCreateDTO,
  options: OrganizationCreateMapperOptions,
): Partial<IOrganizationInternal> {
  return {
    organizationId: options.organizationId ?? new Types.ObjectId(),
    organizationPublicId: options.organizationPublicId,
    organizationName: input.organizationName,
    legalName: input.legalName,
    acronym: input.acronym,
    slug: options.slug ?? toSlug(input.organizationName),
    organizationLogo: input.organizationLogo,
    organizationWebsite: input.organizationWebsite,
    representativeName: input.representativeName,
    representativeAccountId: toObjectIdOrUndefined(
      input.representativeAccountId,
    ),
    organizationEmail: input.organizationEmail,
    organizationAddress: toObjectIdOrUndefined(input.organizationAddress),
    organizationPhone: input.organizationPhone,
    organizationStatus:
      options.organizationStatus ?? ORGANIZATION_DEFAULTS.status,
    privilege: options.privilege ?? ORGANIZATION_DEFAULTS.privilege,
    accessModifier:
      options.accessModifier ?? ORGANIZATION_DEFAULTS.accessModifier,
    createdBy:
      typeof options.createdBy === "string"
        ? new Types.ObjectId(options.createdBy)
        : options.createdBy,
  };
}

/**
 * Mapper: update DTO -> persistence payload
 * Objective: convert partial update input into an update-ready object.
 */
export function mapOrganizationUpdateToPersistence(
  input: IOrganizationUpdateDTO,
  options?: OrganizationUpdateMapperOptions,
): Partial<IOrganizationInternal> {
  const payload: Partial<IOrganizationInternal> = {
    ...input,
  };

  if (input.representativeAccountId !== undefined) {
    payload.representativeAccountId = toObjectIdOrUndefined(
      input.representativeAccountId,
    );
  }

  if (input.organizationAddress !== undefined) {
    payload.organizationAddress = toObjectIdOrUndefined(
      input.organizationAddress,
    );
  }

  if (input.slug === undefined && input.organizationName) {
    payload.slug = toSlug(input.organizationName);
  }

  if (options?.updatedBy) {
    payload.updatedBy =
      typeof options.updatedBy === "string"
        ? new Types.ObjectId(options.updatedBy)
        : options.updatedBy;
  }

  return payload;
}

/**
 * Mapper: internal document -> response DTO
 * Objective: return stable API response shape with string IDs.
 */
export function mapOrganizationToResponse(
  input: IOrganizationInternal,
): IOrganizationResponseDTO {
  return {
    organizationId: toStringId(input.organizationId) ?? "",
    organizationPublicId: input.organizationPublicId,
    organizationName: input.organizationName,
    legalName: input.legalName,
    acronym: input.acronym,
    slug: input.slug,
    organizationLogo: input.organizationLogo,
    organizationWebsite: input.organizationWebsite,
    representativeName: input.representativeName,
    representativeAccountId: toStringId(input.representativeAccountId),
    organizationEmail: input.organizationEmail,
    organizationAddress: toStringId(input.organizationAddress),
    organizationPhone: input.organizationPhone,
    organizationStatus: input.organizationStatus,
    privilege: input.privilege,
    accessModifier: input.accessModifier,
    createdBy: toStringId(input.createdBy) ?? "",
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    deletedAt: input.deletedAt,
    updatedBy: toStringId(input.updatedBy),
  };
}
