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
import { IOrganizationProvider } from "../services/organization-provider.interface";
import { mapCreateInputToOrganizationView } from "../mappers/organization-view.mapper";
import { organizationMockData } from "./organization.mock-data";

export class OrganizationMockProvider implements IOrganizationProvider {
  private data: OrganizationView[] = [...organizationMockData];

  async list(
    query: OrganizationListQuery = {},
  ): Promise<OrganizationListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.toLowerCase();

    const filtered = this.data.filter((item) => {
      if (!query.includeDeleted && item.deletedAt) {
        return false;
      }

      if (query.slug && item.slug !== query.slug) {
        return false;
      }

      if (search) {
        const searchableText =
          `${item.organizationName} ${item.legalName} ${item.slug}`.toLowerCase();
        return searchableText.includes(search);
      }

      return true;
    });

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total: filtered.length,
      page,
      limit,
    };
  }

  async getById(id: string): Promise<OrganizationView> {
    const found = this.data.find((item) => item.organizationId === id);
    if (!found) {
      throw new Error("Organization not found");
    }
    return found;
  }

  async getBySlug(slug: string): Promise<OrganizationView> {
    const found = this.data.find((item) => item.slug === slug);
    if (!found) {
      throw new Error("Organization not found");
    }
    return found;
  }

  async create(input: OrganizationCreateInput): Promise<OrganizationView> {
    const created = mapCreateInputToOrganizationView(
      input,
      this.data.length + 1,
    );
    this.data = [created, ...this.data];
    return created;
  }

  async update(
    id: string,
    input: OrganizationUpdateInput,
  ): Promise<OrganizationView> {
    const current = await this.getById(id);
    const updated = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.data = this.data.map((item) =>
      item.organizationId === id ? updated : item,
    );
    return updated;
  }

  async softDelete(id: string): Promise<OrganizationView> {
    return this.update(id, { organizationStatus: 4, ...{} }).then((item) => {
      const deleted = { ...item, deletedAt: new Date().toISOString() };
      this.data = this.data.map((entry) =>
        entry.organizationId === id ? deleted : entry,
      );
      return deleted;
    });
  }

  async restore(id: string): Promise<OrganizationView> {
    const item = await this.getById(id);
    const restored = {
      ...item,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };
    this.data = this.data.map((entry) =>
      entry.organizationId === id ? restored : entry,
    );
    return restored;
  }

  async bulkUpdateStatus(
    input: OrganizationBulkStatusInput,
  ): Promise<OrganizationBulkResult> {
    const targets = this.resolveTargets(
      input.applyToAll,
      input.organizationIds,
      input.includeDeleted,
    );

    let matchedCount = 0;
    let modifiedCount = 0;

    this.data = this.data.map((item) => {
      if (!targets.has(item.organizationId)) {
        return item;
      }

      matchedCount += 1;
      if (item.organizationStatus !== input.organizationStatus) {
        modifiedCount += 1;
      }

      return {
        ...item,
        organizationStatus: input.organizationStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    return { matchedCount, modifiedCount };
  }

  async bulkSoftDelete(
    input: OrganizationBulkDeleteInput,
  ): Promise<OrganizationBulkResult> {
    const targets = this.resolveTargets(
      input.applyToAll,
      input.organizationIds,
      input.includeDeleted,
    );

    let matchedCount = 0;
    let modifiedCount = 0;

    this.data = this.data.map((item) => {
      if (!targets.has(item.organizationId)) {
        return item;
      }

      matchedCount += 1;
      if (!item.deletedAt) {
        modifiedCount += 1;
      }

      return {
        ...item,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return { matchedCount, modifiedCount };
  }

  private resolveTargets(
    applyToAll?: boolean,
    ids?: string[],
    includeDeleted?: boolean,
  ): Set<string> {
    const source = this.data.filter(
      (item) => includeDeleted || !item.deletedAt,
    );

    if (applyToAll) {
      return new Set(source.map((item) => item.organizationId));
    }

    return new Set(
      (ids ?? []).filter((id) =>
        source.some((item) => item.organizationId === id),
      ),
    );
  }
}
