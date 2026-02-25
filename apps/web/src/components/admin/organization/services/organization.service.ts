import {
  OrganizationBulkDeleteInput,
  OrganizationBulkResult,
  OrganizationBulkStatusInput,
  OrganizationCreateInput,
  OrganizationListQuery,
  OrganizationListResult,
  OrganizationUpdateInput,
  OrganizationView,
} from "../models";
import { OrganizationMockProvider } from "../mock";
import { IOrganizationProvider } from "./organization-provider.interface";

export class OrganizationService {
  constructor(
    private readonly provider: IOrganizationProvider = new OrganizationMockProvider(),
  ) {}

  list(query?: OrganizationListQuery): Promise<OrganizationListResult> {
    return this.provider.list(query);
  }

  getById(id: string): Promise<OrganizationView> {
    return this.provider.getById(id);
  }

  getBySlug(slug: string): Promise<OrganizationView> {
    return this.provider.getBySlug(slug);
  }

  create(input: OrganizationCreateInput): Promise<OrganizationView> {
    return this.provider.create(input);
  }

  update(
    id: string,
    input: OrganizationUpdateInput,
  ): Promise<OrganizationView> {
    return this.provider.update(id, input);
  }

  softDelete(id: string): Promise<OrganizationView> {
    return this.provider.softDelete(id);
  }

  restore(id: string): Promise<OrganizationView> {
    return this.provider.restore(id);
  }

  bulkUpdateStatus(
    input: OrganizationBulkStatusInput,
  ): Promise<OrganizationBulkResult> {
    return this.provider.bulkUpdateStatus(input);
  }

  bulkSoftDelete(
    input: OrganizationBulkDeleteInput,
  ): Promise<OrganizationBulkResult> {
    return this.provider.bulkSoftDelete(input);
  }
}

export const organizationService = new OrganizationService();
