import { Privilege } from "../../../common/enums";
import {
  ORGANIZATION_PUBLIC_ID_PAD_LENGTH,
  ORGANIZATION_PUBLIC_ID_PREFIX,
  ORGANIZATION_PUBLIC_ID_SEPARATOR,
} from "../constants";
import {
  mapOrganizationCreateToPersistence,
  mapOrganizationToResponse,
  mapOrganizationUpdateToPersistence,
} from "../mappers";
import {
  organizationRepository,
  OrganizationBulkOperationResult,
} from "../repositories";
import { organizationCacheService } from "./services-organization-cache";
import { canPerformOrganizationAction, canUpdateOrganization } from "../rules";
import {
  validateOrganizationCreate,
  validateOrganizationUpdate,
  validateOrganizationBulkUpdateStatus,
  validateOrganizationBulkSoftDelete,
} from "../validators/validation-helper";
import {
  IOrganizationCreateDTO,
  IOrganizationResponseDTO,
  IOrganizationUpdateDTO,
} from "../interfaces";
import { OrganizationEventName, organizationEvents } from "../events";
import {
  OrganizationBadRequestError,
  OrganizationForbiddenError,
  OrganizationNotFoundError,
} from "../errors";
import {
  buildOrganizationChangeSet,
  buildOrganizationPublicId,
  maskSensitiveOrganizationData,
  normalizeOrganizationCreateInput,
  normalizeOrganizationUpdateInput,
} from "../utils";
import { toOrganizationAppError } from "../errors/organization-errors";

export interface OrganizationActorContext {
  accountId: string;
  privilege: Privilege;
}

export interface OrganizationBulkUpdateStatusRequest {
  applyToAll?: boolean;
  organizationIds?: string[];
  organizationStatus: number;
  includeDeleted?: boolean;
}

export interface OrganizationBulkSoftDeleteRequest {
  applyToAll?: boolean;
  organizationIds?: string[];
  includeDeleted?: boolean;
}

/**
 * Service: Organization Command
 * Objective: Handle state-changing use cases (create/update/delete/restore).
 */
export class OrganizationCommandService {
  private createEventContext(actor: OrganizationActorContext) {
    return {
      actorAccountId: actor.accountId,
      occurredAt: new Date().toISOString(),
    } as const;
  }

  private async generateOrganizationPublicId(): Promise<string> {
    const { total } = await organizationRepository.list({
      page: 1,
      limit: 1,
      includeDeleted: true,
    });

    return buildOrganizationPublicId(total + 1, {
      prefix: ORGANIZATION_PUBLIC_ID_PREFIX,
      separator: ORGANIZATION_PUBLIC_ID_SEPARATOR,
      padLength: ORGANIZATION_PUBLIC_ID_PAD_LENGTH,
    });
  }

  async createOrganization(
    input: IOrganizationCreateDTO,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "create")) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to create organization",
      );
    }

    const normalizedInput = normalizeOrganizationCreateInput(input);
    const payload = validateOrganizationCreate(normalizedInput);

    const organizationPublicId = await this.generateOrganizationPublicId();
    const createPayload = mapOrganizationCreateToPersistence(payload, {
      createdBy: actor.accountId,
      organizationPublicId,
    });

    let created;
    try {
      created = await organizationRepository.create(createPayload);
    } catch (error) {
      throw toOrganizationAppError(error);
    }
    const response = mapOrganizationToResponse(created);

    await organizationCacheService.setById(response.organizationId, response);
    await organizationCacheService.setBySlug(response.slug, response);
    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.CREATED, {
      context: this.createEventContext(actor),
      organization: maskSensitiveOrganizationData(response),
    });

    return response;
  }

  async updateOrganization(
    id: string,
    input: IOrganizationUpdateDTO,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    const normalizedInput = normalizeOrganizationUpdateInput(input);
    const payload = validateOrganizationUpdate(normalizedInput);
    const fieldNames = Object.keys(payload);
    const policy = canUpdateOrganization(actor.privilege, fieldNames);

    if (!policy.allowed) {
      if (policy.reason === "FORBIDDEN_FIELDS") {
        throw new OrganizationBadRequestError(
          `Forbidden update fields: ${(policy.forbiddenFields ?? []).join(", ")}`,
        );
      }

      throw new OrganizationForbiddenError(
        "Insufficient privilege to update organization",
      );
    }

    const current = await organizationRepository.findById(id);
    if (!current) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    const updatePayload = mapOrganizationUpdateToPersistence(payload, {
      updatedBy: actor.accountId,
    });

    const updated = await organizationRepository.updateById(id, updatePayload);
    if (!updated) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    const response = mapOrganizationToResponse(updated);
    const before = mapOrganizationToResponse(current);
    const changes = buildOrganizationChangeSet(before, response);

    await organizationCacheService.invalidateById(id);
    await organizationCacheService.invalidateBySlug(before.slug);
    await organizationCacheService.setById(response.organizationId, response);
    await organizationCacheService.setBySlug(response.slug, response);
    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.UPDATED, {
      context: this.createEventContext(actor),
      organization: maskSensitiveOrganizationData(response),
      changes,
    });

    return response;
  }

  async softDeleteOrganization(
    id: string,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "softDelete")) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to soft delete organization",
      );
    }

    const deleted = await organizationRepository.softDeleteById(
      id,
      actor.accountId,
    );
    if (!deleted) {
      throw new OrganizationNotFoundError(
        "Organization not found or already deleted",
      );
    }

    const response = mapOrganizationToResponse(deleted);

    await organizationCacheService.invalidateById(id);
    await organizationCacheService.invalidateBySlug(response.slug);
    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.SOFT_DELETED, {
      context: this.createEventContext(actor),
      organization: maskSensitiveOrganizationData(response),
    });

    return response;
  }

  async restoreOrganization(
    id: string,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "restore")) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to restore organization",
      );
    }

    const restored = await organizationRepository.restoreById(
      id,
      actor.accountId,
    );
    if (!restored) {
      throw new OrganizationNotFoundError(
        "Organization not found or not deleted",
      );
    }

    const response = mapOrganizationToResponse(restored);

    await organizationCacheService.setById(response.organizationId, response);
    await organizationCacheService.setBySlug(response.slug, response);
    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.RESTORED, {
      context: this.createEventContext(actor),
      organization: maskSensitiveOrganizationData(response),
    });

    return response;
  }

  async bulkUpdateOrganizationStatus(
    input: OrganizationBulkUpdateStatusRequest,
    actor: OrganizationActorContext,
  ): Promise<OrganizationBulkOperationResult> {
    if (!canPerformOrganizationAction(actor.privilege, "update")) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to bulk update organization",
      );
    }

    const payload = validateOrganizationBulkUpdateStatus(input);
    const result = await organizationRepository.bulkUpdateStatus(
      {
        applyToAll: payload.applyToAll,
        organizationIds: payload.organizationIds,
        includeDeleted: payload.includeDeleted,
      },
      payload.organizationStatus,
      actor.accountId,
    );

    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.BULK_STATUS_UPDATED, {
      context: this.createEventContext(actor),
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    return result;
  }

  async bulkSoftDeleteOrganizations(
    input: OrganizationBulkSoftDeleteRequest,
    actor: OrganizationActorContext,
  ): Promise<OrganizationBulkOperationResult> {
    if (!canPerformOrganizationAction(actor.privilege, "softDelete")) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to bulk soft delete organization",
      );
    }

    const payload = validateOrganizationBulkSoftDelete(input);
    const result = await organizationRepository.bulkSoftDelete(
      {
        applyToAll: payload.applyToAll,
        organizationIds: payload.organizationIds,
        includeDeleted: payload.includeDeleted,
      },
      actor.accountId,
    );

    await organizationCacheService.invalidateLists();

    organizationEvents.emit(OrganizationEventName.BULK_SOFT_DELETED, {
      context: this.createEventContext(actor),
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    return result;
  }
}

export const organizationCommandService = new OrganizationCommandService();
