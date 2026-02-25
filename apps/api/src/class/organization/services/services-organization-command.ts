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
import { organizationRepository } from "../repositories";
import { canPerformOrganizationAction, canUpdateOrganization } from "../rules";
import {
  organizationCreateSchema,
  organizationUpdateSchema,
} from "../validators";
import {
  IOrganizationCreateDTO,
  IOrganizationResponseDTO,
  IOrganizationUpdateDTO,
} from "../interfaces";

export interface OrganizationActorContext {
  accountId: string;
  privilege: Privilege;
}

/**
 * Service: Organization Command
 * Objective: Handle state-changing use cases (create/update/delete/restore).
 */
export class OrganizationCommandService {
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
    return mapOrganizationToResponse(created);
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

    return mapOrganizationToResponse(updated);
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

    return mapOrganizationToResponse(deleted);
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

    return mapOrganizationToResponse(restored);
  }
}

export const organizationCommandService = new OrganizationCommandService();
