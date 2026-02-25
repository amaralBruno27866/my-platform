import { OrganizationCreateInput, OrganizationUpdateInput } from "../models";

export function validateCreateOrganizationInput(
  input: OrganizationCreateInput,
): string[] {
  const errors: string[] = [];

  if (!input.organizationName?.trim())
    errors.push("organizationName is required");
  if (!input.legalName?.trim()) errors.push("legalName is required");
  if (!input.acronym?.trim()) errors.push("acronym is required");
  if (!input.organizationLogo?.trim())
    errors.push("organizationLogo is required");
  if (!input.organizationWebsite?.trim())
    errors.push("organizationWebsite is required");
  if (!input.representativeName?.trim())
    errors.push("representativeName is required");

  return errors;
}

export function validateUpdateOrganizationInput(
  input: OrganizationUpdateInput,
): string[] {
  const hasAnyField = Object.values(input).some(
    (value) => value !== undefined && value !== null && value !== "",
  );
  if (!hasAnyField) {
    return ["At least one field is required for update"];
  }
  return [];
}
