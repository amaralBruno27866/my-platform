import { organizationState } from "../state/organization.state";

export async function loadOrganizationDetailPage(organizationId: string) {
  await organizationState.selectById(organizationId);
  return organizationState.value.selected;
}
