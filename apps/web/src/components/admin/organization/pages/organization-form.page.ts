import {
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "../models/organization-form.types";
import { organizationState } from "../state/organization.state";

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
