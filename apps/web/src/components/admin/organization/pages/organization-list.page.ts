import { OrganizationListQuery } from "../models";
import { organizationState } from "../state";

export async function loadOrganizationListPage(query?: OrganizationListQuery) {
  await organizationState.load(query);
  return organizationState.value;
}
