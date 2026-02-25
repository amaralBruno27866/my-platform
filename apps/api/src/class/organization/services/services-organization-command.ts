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
import { canPerformOrganizationAction, canUpdateOrganization } from "../rules";
import {
  organizationBulkSoftDeleteSchema,
  organizationBulkUpdateStatusSchema,
  organizationCreateSchema,
  organizationUpdateSchema,
} from "../validators";
import {
  IOrganizationCreateDTO,
  IOrganizationResponseDTO,
  IOrganizationUpdateDTO,
} from "../interfaces";
import { OrganizationEventName, organizationEvents } from "../events";

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

    const nextSequence = total + 1;
    const sequence = String(nextSequence).padStart(
      ORGANIZATION_PUBLIC_ID_PAD_LENGTH,
      "0",
    );

    return `${ORGANIZATION_PUBLIC_ID_PREFIX}${ORGANIZATION_PUBLIC_ID_SEPARATOR}${sequence}`;
  }

  async createOrganization(
    input: IOrganizationCreateDTO,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "create")) {
      throw new Error("Insufficient privilege to create organization");
    }

    const payload = organizationCreateSchema.parse(input);

    const organizationPublicId = await this.generateOrganizationPublicId();
    const createPayload = mapOrganizationCreateToPersistence(payload, {
      createdBy: actor.accountId,
      organizationPublicId,
    });

    const created = await organizationRepository.create(createPayload);
    const response = mapOrganizationToResponse(created);

    organizationEvents.emit(OrganizationEventName.CREATED, {
      context: this.createEventContext(actor),
      organization: response,
    });

    return response;
  }

  async updateOrganization(
    id: string,
    input: IOrganizationUpdateDTO,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    const payload = organizationUpdateSchema.parse(input);
    const fieldNames = Object.keys(payload);
    const policy = canUpdateOrganization(actor.privilege, fieldNames);

    if (!policy.allowed) {
      if (policy.reason === "FORBIDDEN_FIELDS") {
        throw new Error(
          `Forbidden update fields: ${(policy.forbiddenFields ?? []).join(", ")}`,
        );
      }

      throw new Error("Insufficient privilege to update organization");
    }

    const updatePayload = mapOrganizationUpdateToPersistence(payload, {
      updatedBy: actor.accountId,
    });

    const updated = await organizationRepository.updateById(id, updatePayload);
    if (!updated) {
      throw new Error("Organization not found");
    }

    const response = mapOrganizationToResponse(updated);

    organizationEvents.emit(OrganizationEventName.UPDATED, {
      context: this.createEventContext(actor),
      organization: response,
    });

    return response;
  }

  async softDeleteOrganization(
    id: string,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "softDelete")) {
      throw new Error("Insufficient privilege to soft delete organization");
    }

    const deleted = await organizationRepository.softDeleteById(
      id,
      actor.accountId,
    );
    if (!deleted) {
      throw new Error("Organization not found or already deleted");
    }

    const response = mapOrganizationToResponse(deleted);

    organizationEvents.emit(OrganizationEventName.SOFT_DELETED, {
      context: this.createEventContext(actor),
      organization: response,
    });

    return response;
  }

  async restoreOrganization(
    id: string,
    actor: OrganizationActorContext,
  ): Promise<IOrganizationResponseDTO> {
    if (!canPerformOrganizationAction(actor.privilege, "restore")) {
      throw new Error("Insufficient privilege to restore organization");
    }

    const restored = await organizationRepository.restoreById(
      id,
      actor.accountId,
    );
    if (!restored) {
      throw new Error("Organization not found or not deleted");
    }

    const response = mapOrganizationToResponse(restored);

    organizationEvents.emit(OrganizationEventName.RESTORED, {
      context: this.createEventContext(actor),
      organization: response,
    });

    return response;
  }

  async bulkUpdateOrganizationStatus(
    input: OrganizationBulkUpdateStatusRequest,
    actor: OrganizationActorContext,
  ): Promise<OrganizationBulkOperationResult> {
    if (!canPerformOrganizationAction(actor.privilege, "update")) {
      throw new Error("Insufficient privilege to bulk update organization");
    }

    const payload = organizationBulkUpdateStatusSchema.parse(input);
    const result = await organizationRepository.bulkUpdateStatus(
      {
        applyToAll: payload.applyToAll,
        organizationIds: payload.organizationIds,
        includeDeleted: payload.includeDeleted,
      },
      payload.organizationStatus,
      actor.accountId,
    );

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
      throw new Error(
        "Insufficient privilege to bulk soft delete organization",
      );
    }

    const payload = organizationBulkSoftDeleteSchema.parse(input);
    const result = await organizationRepository.bulkSoftDelete(
      {
        applyToAll: payload.applyToAll,
        organizationIds: payload.organizationIds,
        includeDeleted: payload.includeDeleted,
      },
      actor.accountId,
    );

    organizationEvents.emit(OrganizationEventName.BULK_SOFT_DELETED, {
      context: this.createEventContext(actor),
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    return result;
  }
}

export const organizationCommandService = new OrganizationCommandService();
