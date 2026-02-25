import { OrganizationCreateInput, OrganizationUpdateInput } from "../models";
import { organizationState } from "../state";

export async function submitOrganizationCreatePage(
  input: OrganizationCreateInput,
) {
  return organizationState.create(input);
}

export async function submitOrganizationEditPage(
  organizationId: string,
  input: OrganizationUpdateInput,
) {
  return organizationState.update(organizationId, input);
}
