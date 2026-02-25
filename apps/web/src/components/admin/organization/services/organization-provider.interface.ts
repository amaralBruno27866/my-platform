import {
  OrganizationBulkDeleteInput,
  OrganizationBulkStatusInput,
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "../models/organization-form.types";
import {
  OrganizationBulkResult,
  OrganizationListQuery,
  OrganizationListResult,
  OrganizationView,
} from "../models/organization.types";

export interface IOrganizationProvider {
  list(query?: OrganizationListQuery): Promise<OrganizationListResult>;
  getById(id: string): Promise<OrganizationView>;
  getBySlug(slug: string): Promise<OrganizationView>;
  create(input: OrganizationCreateInput): Promise<OrganizationView>;
  update(id: string, input: OrganizationUpdateInput): Promise<OrganizationView>;
  softDelete(id: string): Promise<OrganizationView>;
  restore(id: string): Promise<OrganizationView>;
  bulkUpdateStatus(
    input: OrganizationBulkStatusInput,
  ): Promise<OrganizationBulkResult>;
  bulkSoftDelete(
    input: OrganizationBulkDeleteInput,
  ): Promise<OrganizationBulkResult>;
}
