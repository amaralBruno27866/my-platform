import { organizationState } from "../state";

export async function loadOrganizationDetailPage(organizationId: string) {
  await organizationState.selectById(organizationId);
  return organizationState.value.selected;
}
