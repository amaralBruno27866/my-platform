import { z } from "zod";
import { AccessModifier, Privilege } from "../../../common/enums";
import {
  ORGANIZATION_IMMUTABLE_FIELDS,
  ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS,
} from "../constants";
import { OrganizationSttus } from "../enums";

const objectIdPattern = /^[a-f\d]{24}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const phonePattern = /^\+?[0-9()\-\s]{7,20}$/;

const objectIdSchema = z
  .string()
  .trim()
  .regex(objectIdPattern, "Invalid ObjectId format");

const nullableString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

/**
 * Validator: Organization Create Payload
 * Objective: Validate client input for organization creation.
 */
export const organizationCreateSchema = z
  .object({
    organizationName: z.string().trim().min(2).max(120),
    legalName: z.string().trim().min(2).max(160),
    acronym: z
      .string()
      .trim()
      .min(2)
      .max(12)
      .transform((value) => value.toUpperCase()),
    organizationLogo: z.string().trim().url(),
    organizationWebsite: z.string().trim().url(),
    representativeName: z.string().trim().min(2).max(120),
    representativeAccountId: objectIdSchema.optional(),
    organizationEmail: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase())
      .optional(),
    organizationAddress: objectIdSchema.optional(),
    organizationPhone: z
      .string()
      .trim()
      .regex(phonePattern, "Invalid phone format")
      .optional(),
  })
  .strict();

const editableFieldNames = new Set<string>([
  ...ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS,
]);

/**
 * Validator: Organization Update Payload
 * Objective: Validate partial updates and reject changes to non-editable fields.
 */
export const organizationUpdateSchema = z
  .object({
    organizationName: z.string().trim().min(2).max(120).optional(),
    legalName: z.string().trim().min(2).max(160).optional(),
    acronym: z
      .string()
      .trim()
      .min(2)
      .max(12)
      .transform((value) => value.toUpperCase())
      .optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(slugPattern, "Invalid slug format")
      .min(3)
      .max(120)
      .optional(),
    organizationLogo: z.string().trim().url().optional(),
    organizationWebsite: z.string().trim().url().optional(),
    representativeName: z.string().trim().min(2).max(120).optional(),
    representativeAccountId: nullableString
      .pipe(objectIdSchema.optional())
      .optional(),
    organizationEmail: nullableString
      .pipe(
        z
          .string()
          .trim()
          .email()
          .transform((value) => value.toLowerCase())
          .optional(),
      )
      .optional(),
    organizationAddress: nullableString
      .pipe(objectIdSchema.optional())
      .optional(),
    organizationPhone: nullableString
      .pipe(
        z
          .string()
          .trim()
          .regex(phonePattern, "Invalid phone format")
          .optional(),
      )
      .optional(),
  })
  .strict()
  .superRefine((payload, context) => {
    const inputFields = Object.keys(payload);

    if (inputFields.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided for update",
      });
      return;
    }

    const forbiddenFields = inputFields.filter(
      (fieldName) => !editableFieldNames.has(fieldName),
    );

    if (forbiddenFields.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Non-editable fields detected: ${forbiddenFields.join(", ")}`,
      });
    }
  });

/**
 * Validator: Organization query filters for list/search endpoints.
 */
export const organizationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(slugPattern, "Invalid slug format")
      .optional(),
    organizationStatus: z.nativeEnum(OrganizationSttus).optional(),
    privilege: z.nativeEnum(Privilege).optional(),
    accessModifier: z.nativeEnum(AccessModifier).optional(),
    includeDeleted: z.coerce.boolean().default(false),
  })
  .strict();

/**
 * Immutable fields helper validator for defensive checks in service layer.
 */
export const organizationImmutableFieldsSchema = z
  .array(z.string())
  .superRefine((fields, context) => {
    const immutableFields = new Set<string>([...ORGANIZATION_IMMUTABLE_FIELDS]);
    const violations = fields.filter((fieldName) =>
      immutableFields.has(fieldName),
    );

    if (violations.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Immutable fields cannot be changed: ${violations.join(", ")}`,
      });
    }
  });

/**
 * Validator: Bulk status update payload
 * Objective: Validate mass status changes with explicit safety controls.
 */
export const organizationBulkUpdateStatusSchema = z
  .object({
    applyToAll: z.boolean().default(false),
    organizationIds: z.array(objectIdSchema).min(1).max(1000).optional(),
    organizationStatus: z.nativeEnum(OrganizationSttus),
    includeDeleted: z.boolean().default(false),
  })
  .strict()
  .superRefine((payload, context) => {
    if (
      !payload.applyToAll &&
      (!payload.organizationIds || payload.organizationIds.length === 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide organizationIds or set applyToAll=true",
      });
    }
  });

/**
 * Validator: Bulk soft-delete payload
 * Objective: Validate mass soft-delete operations with explicit safety controls.
 */
export const organizationBulkSoftDeleteSchema = z
  .object({
    applyToAll: z.boolean().default(false),
    organizationIds: z.array(objectIdSchema).min(1).max(1000).optional(),
    includeDeleted: z.boolean().default(false),
  })
  .strict()
  .superRefine((payload, context) => {
    if (
      !payload.applyToAll &&
      (!payload.organizationIds || payload.organizationIds.length === 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide organizationIds or set applyToAll=true",
      });
    }
  });

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;
export type OrganizationQueryInput = z.infer<typeof organizationQuerySchema>;
export type OrganizationBulkUpdateStatusInput = z.infer<
  typeof organizationBulkUpdateStatusSchema
>;
export type OrganizationBulkSoftDeleteInput = z.infer<
  typeof organizationBulkSoftDeleteSchema
>;
