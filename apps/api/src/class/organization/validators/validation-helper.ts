/**
 * Validation helpers for organization schemas
 * Wraps Zod parse() and converts errors to OrganizationAppError
 * Each function is specifically typed for type safety
 */
import { z } from "zod";
import { OrganizationBadRequestError } from "../errors/organization-errors";
import {
  organizationCreateSchema,
  organizationUpdateSchema,
  organizationQuerySchema,
  organizationBulkUpdateStatusSchema,
  organizationBulkSoftDeleteSchema,
} from "./validators-organization";

// Type-safe validation for create
export function validateOrganizationCreate(
  data: unknown,
): z.infer<typeof organizationCreateSchema> {
  try {
    return organizationCreateSchema.parse(data);
  } catch (error) {
    throw new OrganizationBadRequestError(
      "Validation failed",
      error instanceof Error ? error.message : error,
    );
  }
}

// Type-safe validation for update
export function validateOrganizationUpdate(
  data: unknown,
): z.infer<typeof organizationUpdateSchema> {
  try {
    return organizationUpdateSchema.parse(data);
  } catch (error) {
    throw new OrganizationBadRequestError(
      "Validation failed",
      error instanceof Error ? error.message : error,
    );
  }
}

// Type-safe validation for query
export function validateOrganizationQuery(
  data: unknown,
): z.infer<typeof organizationQuerySchema> {
  try {
    return organizationQuerySchema.parse(data);
  } catch (error) {
    throw new OrganizationBadRequestError(
      "Validation failed",
      error instanceof Error ? error.message : error,
    );
  }
}

// Type-safe validation for bulk update status
export function validateOrganizationBulkUpdateStatus(
  data: unknown,
): z.infer<typeof organizationBulkUpdateStatusSchema> {
  try {
    return organizationBulkUpdateStatusSchema.parse(data);
  } catch (error) {
    throw new OrganizationBadRequestError(
      "Validation failed",
      error instanceof Error ? error.message : error,
    );
  }
}

// Type-safe validation for bulk soft delete
export function validateOrganizationBulkSoftDelete(
  data: unknown,
): z.infer<typeof organizationBulkSoftDeleteSchema> {
  try {
    return organizationBulkSoftDeleteSchema.parse(data);
  } catch (error) {
    throw new OrganizationBadRequestError(
      "Validation failed",
      error instanceof Error ? error.message : error,
    );
  }
}
