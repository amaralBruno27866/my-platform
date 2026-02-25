import { Types } from "mongoose";
import { IOrganizationInternal } from "../interfaces";
import { OrganizationModel } from "../schema";

type OrganizationQueryFilter = {
  _id?: Types.ObjectId | { $in: Types.ObjectId[] };
  organizationId?: Types.ObjectId;
  organizationPublicId?: string;
  slug?: string;
  deletedAt?: Date | null | { $ne: null };
  $text?: { $search: string };
};

export interface OrganizationBulkFilter {
  applyToAll?: boolean;
  organizationIds?: string[];
  includeDeleted?: boolean;
}

export interface OrganizationBulkOperationResult {
  matchedCount: number;
  modifiedCount: number;
}

export interface OrganizationListQuery {
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
  includeDeleted?: boolean;
}

export interface OrganizationListResult {
  data: IOrganizationInternal[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Repository: Organization
 * Objective: Encapsulate all persistence operations for organization documents.
 */
export class OrganizationRepository {
  private buildBulkFilter(
    filterInput: OrganizationBulkFilter,
  ): OrganizationQueryFilter {
    const filter: OrganizationQueryFilter = {};

    if (!filterInput.includeDeleted) {
      filter.deletedAt = null;
    }

    if (!filterInput.applyToAll && filterInput.organizationIds?.length) {
      filter._id = {
        $in: filterInput.organizationIds.map((id) => new Types.ObjectId(id)),
      };
    }

    return filter;
  }

  async create(
    payload: Partial<IOrganizationInternal>,
  ): Promise<IOrganizationInternal> {
    const created = await OrganizationModel.create(payload);
    return created;
  }

  async findById(
    id: string | Types.ObjectId,
    includeDeleted = false,
  ): Promise<IOrganizationInternal | null> {
    const filter: OrganizationQueryFilter = {
      _id: typeof id === "string" ? new Types.ObjectId(id) : id,
    };

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    return OrganizationModel.findOne(filter);
  }

  async findByOrganizationId(
    organizationId: string | Types.ObjectId,
    includeDeleted = false,
  ): Promise<IOrganizationInternal | null> {
    const filter: OrganizationQueryFilter = {
      organizationId:
        typeof organizationId === "string"
          ? new Types.ObjectId(organizationId)
          : organizationId,
    };

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    return OrganizationModel.findOne(filter);
  }

  async findByPublicId(
    organizationPublicId: string,
    includeDeleted = false,
  ): Promise<IOrganizationInternal | null> {
    const filter: OrganizationQueryFilter = {
      organizationPublicId,
    };

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    return OrganizationModel.findOne(filter);
  }

  async findBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<IOrganizationInternal | null> {
    const filter: OrganizationQueryFilter = {
      slug,
    };

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    return OrganizationModel.findOne(filter);
  }

  async list(
    query: OrganizationListQuery = {},
  ): Promise<OrganizationListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: OrganizationQueryFilter = {};

    if (!query.includeDeleted) {
      filter.deletedAt = null;
    }

    if (query.slug) {
      filter.slug = query.slug;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [data, total] = await Promise.all([
      OrganizationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrganizationModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateById(
    id: string | Types.ObjectId,
    payload: Partial<IOrganizationInternal>,
  ): Promise<IOrganizationInternal | null> {
    return OrganizationModel.findOneAndUpdate(
      {
        _id: typeof id === "string" ? new Types.ObjectId(id) : id,
        deletedAt: null,
      },
      { $set: payload },
      { new: true, runValidators: true },
    );
  }

  async softDeleteById(
    id: string | Types.ObjectId,
    updatedBy?: string | Types.ObjectId,
  ): Promise<IOrganizationInternal | null> {
    return OrganizationModel.findOneAndUpdate(
      {
        _id: typeof id === "string" ? new Types.ObjectId(id) : id,
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: new Date(),
          ...(updatedBy
            ? {
                updatedBy:
                  typeof updatedBy === "string"
                    ? new Types.ObjectId(updatedBy)
                    : updatedBy,
              }
            : {}),
        },
      },
      { new: true, runValidators: true },
    );
  }

  async restoreById(
    id: string | Types.ObjectId,
    updatedBy?: string | Types.ObjectId,
  ): Promise<IOrganizationInternal | null> {
    return OrganizationModel.findOneAndUpdate(
      {
        _id: typeof id === "string" ? new Types.ObjectId(id) : id,
        deletedAt: { $ne: null },
      },
      {
        $set: {
          deletedAt: null,
          ...(updatedBy
            ? {
                updatedBy:
                  typeof updatedBy === "string"
                    ? new Types.ObjectId(updatedBy)
                    : updatedBy,
              }
            : {}),
        },
      },
      { new: true, runValidators: true },
    );
  }

  async bulkUpdateStatus(
    filterInput: OrganizationBulkFilter,
    organizationStatus: number,
    updatedBy: string | Types.ObjectId,
  ): Promise<OrganizationBulkOperationResult> {
    const filter = this.buildBulkFilter(filterInput);

    const result = await OrganizationModel.updateMany(
      filter,
      {
        $set: {
          organizationStatus,
          updatedBy:
            typeof updatedBy === "string"
              ? new Types.ObjectId(updatedBy)
              : updatedBy,
        },
      },
      { runValidators: true },
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async bulkSoftDelete(
    filterInput: OrganizationBulkFilter,
    updatedBy: string | Types.ObjectId,
  ): Promise<OrganizationBulkOperationResult> {
    const filter = this.buildBulkFilter(filterInput);

    const result = await OrganizationModel.updateMany(
      filter,
      {
        $set: {
          deletedAt: new Date(),
          updatedBy:
            typeof updatedBy === "string"
              ? new Types.ObjectId(updatedBy)
              : updatedBy,
        },
      },
      { runValidators: true },
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }
}

export const organizationRepository = new OrganizationRepository();
