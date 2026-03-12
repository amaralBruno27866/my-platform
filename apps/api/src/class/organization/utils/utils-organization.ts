import { createHash } from "node:crypto";
import {
  IOrganizationCreateDTO,
  IOrganizationResponseDTO,
  IOrganizationUpdateDTO,
} from "../interfaces";

export interface OrganizationChangeSetItem {
  field: string;
  before: unknown;
  after: unknown;
}

const NAME_LOWERCASE_PARTICLES = new Set([
  "and",
  "of",
  "the",
  "in",
  "on",
  "at",
  "for",
  "to",
]);

export function formatOrganizationName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (index > 0 && NAME_LOWERCASE_PARTICLES.has(lowerWord)) {
        return lowerWord;
      }

      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(" ");
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatNorthAmericanPhone(value: string): string {
  const digits = sanitizePhone(value);

  if (digits.length !== 10) {
    return value.trim();
  }

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  return `(${area}) ${prefix}-${line}`;
}

export function normalizeOrganizationCreateInput(
  input: IOrganizationCreateDTO,
): IOrganizationCreateDTO {
  return {
    ...input,
    organizationName: formatOrganizationName(input.organizationName),
    legalName: formatOrganizationName(input.legalName),
    representativeName: formatOrganizationName(input.representativeName),
    acronym: input.acronym.trim().toUpperCase(),
    organizationEmail: input.organizationEmail?.trim().toLowerCase(),
    organizationPhone: input.organizationPhone
      ? formatNorthAmericanPhone(input.organizationPhone)
      : undefined,
  };
}

export function normalizeOrganizationUpdateInput(
  input: IOrganizationUpdateDTO,
): IOrganizationUpdateDTO {
  const normalized: IOrganizationUpdateDTO = {
    ...input,
    organizationName: input.organizationName
      ? formatOrganizationName(input.organizationName)
      : undefined,
    legalName: input.legalName
      ? formatOrganizationName(input.legalName)
      : undefined,
    representativeName: input.representativeName
      ? formatOrganizationName(input.representativeName)
      : undefined,
    acronym: input.acronym ? input.acronym.trim().toUpperCase() : undefined,
    organizationEmail: input.organizationEmail
      ? input.organizationEmail.trim().toLowerCase()
      : undefined,
    organizationPhone: input.organizationPhone
      ? formatNorthAmericanPhone(input.organizationPhone)
      : undefined,
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined),
  ) as IOrganizationUpdateDTO;
}

export function generateOrganizationSlug(organizationName: string): string {
  return organizationName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildOrganizationPublicId(
  sequence: number,
  options: {
    prefix: string;
    separator: string;
    padLength: number;
  },
): string {
  const sequencePart = String(sequence).padStart(options.padLength, "0");
  return `${options.prefix}${options.separator}${sequencePart}`;
}

export function maskSensitiveOrganizationData(
  organization: IOrganizationResponseDTO,
): IOrganizationResponseDTO {
  const maskedEmail = organization.organizationEmail
    ? organization.organizationEmail.replace(/(^.).*(@.*$)/, "$1***$2")
    : undefined;

  const maskedPhone = organization.organizationPhone
    ? organization.organizationPhone.replace(/\d(?=\d{4})/g, "*")
    : undefined;

  return {
    ...organization,
    organizationEmail: maskedEmail,
    organizationPhone: maskedPhone,
  };
}

export function hashSensitiveValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function buildOrganizationChangeSet(
  before: IOrganizationResponseDTO,
  after: IOrganizationResponseDTO,
): OrganizationChangeSetItem[] {
  const changes: OrganizationChangeSetItem[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const beforeValue = before[key as keyof IOrganizationResponseDTO];
    const afterValue = after[key as keyof IOrganizationResponseDTO];

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push({
        field: key,
        before: beforeValue,
        after: afterValue,
      });
    }
  }

  return changes;
}
