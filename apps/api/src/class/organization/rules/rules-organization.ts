import { AccessModifier, Privilege } from "../../../common/enums";
import {
  ORGANIZATION_IMMUTABLE_FIELDS,
  ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS,
} from "../constants";

export type OrganizationCrudAction =
  | "create"
  | "read"
  | "update"
  | "softDelete"
  | "delete"
  | "restore";

/**
 * Organization policy matrix derived from docs/CRUD-matrix.csv.
 * For this entity, only MASTER privilege can execute CRUD operations.
 */
const ORGANIZATION_CRUD_POLICY: Record<
  Privilege,
  Record<OrganizationCrudAction, boolean>
> = {
  [Privilege.LOW]: {
    create: false,
    read: false,
    update: false,
    softDelete: false,
    delete: false,
    restore: false,
  },
  [Privilege.MEDIUM]: {
    create: false,
    read: false,
    update: false,
    softDelete: false,
    delete: false,
    restore: false,
  },
  [Privilege.HIGH]: {
    create: false,
    read: false,
    update: false,
    softDelete: false,
    delete: false,
    restore: false,
  },
  [Privilege.MASTER]: {
    create: true,
    read: true,
    update: true,
    softDelete: true,
    delete: true,
    restore: true,
  },
};

/**
 * Checks whether a privilege level can execute a CRUD action for organization.
 */
export function canPerformOrganizationAction(
  privilege: Privilege,
  action: OrganizationCrudAction,
): boolean {
  return ORGANIZATION_CRUD_POLICY[privilege]?.[action] ?? false;
}

/**
 * For organization entity, only privilege 4 can access records.
 */
export function canReadOrganization(
  privilege: Privilege,
  _accessModifier?: AccessModifier,
): boolean {
  return canPerformOrganizationAction(privilege, "read");
}

/**
 * Verifies if a single field is editable for privilege 4 users.
 */
export function canEditOrganizationField(fieldName: string): boolean {
  return ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS.includes(
    fieldName as (typeof ORGANIZATION_PRIVILEGE_4_EDITABLE_FIELDS)[number],
  );
}

/**
 * Verifies if provided update fields are all allowed by organization policy.
 */
export function validateOrganizationUpdateFields(fieldNames: string[]): {
  isValid: boolean;
  forbiddenFields: string[];
} {
  const forbiddenFields = fieldNames.filter((fieldName) => {
    const isImmutable = ORGANIZATION_IMMUTABLE_FIELDS.includes(
      fieldName as (typeof ORGANIZATION_IMMUTABLE_FIELDS)[number],
    );

    if (isImmutable) {
      return true;
    }

    return !canEditOrganizationField(fieldName);
  });

  return {
    isValid: forbiddenFields.length === 0,
    forbiddenFields,
  };
}

/**
 * Enforces organization update permission and field-level policy in one check.
 */
export function canUpdateOrganization(
  privilege: Privilege,
  fieldNames: string[],
): {
  allowed: boolean;
  reason?: "INSUFFICIENT_PRIVILEGE" | "FORBIDDEN_FIELDS";
  forbiddenFields?: string[];
} {
  if (!canPerformOrganizationAction(privilege, "update")) {
    return {
      allowed: false,
      reason: "INSUFFICIENT_PRIVILEGE",
    };
  }

  const fieldValidation = validateOrganizationUpdateFields(fieldNames);
  if (!fieldValidation.isValid) {
    return {
      allowed: false,
      reason: "FORBIDDEN_FIELDS",
      forbiddenFields: fieldValidation.forbiddenFields,
    };
  }

  return {
    allowed: true,
  };
}
