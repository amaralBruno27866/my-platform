import {
  OrganizationBulkDeleteInput,
  OrganizationBulkStatusInput,
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "../models/organization-form.types";
import {
  OrganizationListQuery,
  OrganizationListResult,
  OrganizationView,
} from "../models/organization.types";
import {
  organizationService,
  OrganizationService,
} from "../services/organization.service";

export interface OrganizationStateSnapshot {
  items: OrganizationView[];
  selected?: OrganizationView;
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error?: string;
}

export class OrganizationState {
  private snapshot: OrganizationStateSnapshot = {
    items: [],
    selected: undefined,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: undefined,
  };

  constructor(
    private readonly service: OrganizationService = organizationService,
  ) {}

  get value(): OrganizationStateSnapshot {
    return this.snapshot;
  }

  async load(query?: OrganizationListQuery): Promise<OrganizationListResult> {
    this.snapshot = { ...this.snapshot, loading: true, error: undefined };

    try {
      const result = await this.service.list(query);
      this.snapshot = {
        ...this.snapshot,
        items: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        loading: false,
      };
      return result;
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      };
      throw error;
    }
  }

  async selectById(id: string): Promise<OrganizationView> {
    const selected = await this.service.getById(id);
    this.snapshot = { ...this.snapshot, selected };
    return selected;
  }

  async create(input: OrganizationCreateInput): Promise<OrganizationView> {
    const created = await this.service.create(input);
    await this.load({ page: this.snapshot.page, limit: this.snapshot.limit });
    return created;
  }

  async update(
    id: string,
    input: OrganizationUpdateInput,
  ): Promise<OrganizationView> {
    const updated = await this.service.update(id, input);
    await this.load({ page: this.snapshot.page, limit: this.snapshot.limit });
    return updated;
  }

  async softDelete(id: string): Promise<OrganizationView> {
    const deleted = await this.service.softDelete(id);
    await this.load({ page: this.snapshot.page, limit: this.snapshot.limit });
    return deleted;
  }

  async restore(id: string): Promise<OrganizationView> {
    const restored = await this.service.restore(id);
    await this.load({
      page: this.snapshot.page,
      limit: this.snapshot.limit,
      includeDeleted: true,
    });
    return restored;
  }

  async bulkUpdateStatus(input: OrganizationBulkStatusInput): Promise<void> {
    await this.service.bulkUpdateStatus(input);
    await this.load({
      page: this.snapshot.page,
      limit: this.snapshot.limit,
      includeDeleted: input.includeDeleted,
    });
  }

  async bulkSoftDelete(input: OrganizationBulkDeleteInput): Promise<void> {
    await this.service.bulkSoftDelete(input);
    await this.load({
      page: this.snapshot.page,
      limit: this.snapshot.limit,
      includeDeleted: input.includeDeleted,
    });
  }
}

export const organizationState = new OrganizationState();
