import { OrganizationListQuery } from "../models/organization.types";
import { organizationState } from "../state/organization.state";

export async function loadOrganizationListPage(query?: OrganizationListQuery) {
  await organizationState.load(query);
  return organizationState.value;
}
