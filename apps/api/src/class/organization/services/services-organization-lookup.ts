import { Privilege } from "../../../common/enums";
import { mapOrganizationToResponse } from "../mappers";
import { organizationRepository } from "../repositories";
import { canReadOrganization } from "../rules";
import { organizationQuerySchema } from "../validators";
import { IOrganizationResponseDTO } from "../interfaces";
import {
  OrganizationForbiddenError,
  OrganizationNotFoundError,
} from "../errors";

export interface OrganizationLookupActorContext {
  privilege: Privilege;
}

export interface OrganizationLookupListResult {
  data: IOrganizationResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Service: Organization Lookup
 * Objective: Handle read-only use cases (get/list/search).
 */
export class OrganizationLookupService {
  private ensureReadPermission(actor: OrganizationLookupActorContext): void {
    if (!canReadOrganization(actor.privilege)) {
      throw new OrganizationForbiddenError(
        "Insufficient privilege to read organization data",
      );
    }
  }

  async getOrganizationById(
    id: string,
    actor: OrganizationLookupActorContext,
  ): Promise<IOrganizationResponseDTO> {
    this.ensureReadPermission(actor);

    const found = await organizationRepository.findById(id);
    if (!found) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    return mapOrganizationToResponse(found);
  }

  async getOrganizationBySlug(
    slug: string,
    actor: OrganizationLookupActorContext,
  ): Promise<IOrganizationResponseDTO> {
    this.ensureReadPermission(actor);

    const found = await organizationRepository.findBySlug(slug);
    if (!found) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    return mapOrganizationToResponse(found);
  }

  async listOrganizations(
    queryInput: unknown,
    actor: OrganizationLookupActorContext,
  ): Promise<OrganizationLookupListResult> {
    this.ensureReadPermission(actor);

    const query = organizationQuerySchema.parse(queryInput ?? {});
    const result = await organizationRepository.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
      slug: query.slug,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: result.data.map(mapOrganizationToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}

export const organizationLookupService = new OrganizationLookupService();
