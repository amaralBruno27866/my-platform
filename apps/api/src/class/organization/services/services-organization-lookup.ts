import { Privilege } from "../../../common/enums";
import { mapOrganizationToResponse } from "../mappers";
import { organizationRepository } from "../repositories";
import { canReadOrganization } from "../rules";
import { validateOrganizationQuery } from "../validators/validation-helper";
import { IOrganizationResponseDTO } from "../interfaces";
import { organizationCacheService } from "./services-organization-cache";
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

    const cached = await organizationCacheService.getById(id);
    if (cached) {
      return cached;
    }

    const found = await organizationRepository.findById(id);
    if (!found) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    const response = mapOrganizationToResponse(found);
    await organizationCacheService.setById(id, response);
    await organizationCacheService.setBySlug(response.slug, response);
    return response;
  }

  async getOrganizationBySlug(
    slug: string,
    actor: OrganizationLookupActorContext,
  ): Promise<IOrganizationResponseDTO> {
    this.ensureReadPermission(actor);

    const cached = await organizationCacheService.getBySlug(slug);
    if (cached) {
      return cached;
    }

    const found = await organizationRepository.findBySlug(slug);
    if (!found) {
      throw new OrganizationNotFoundError("Organization not found");
    }

    const response = mapOrganizationToResponse(found);
    await organizationCacheService.setById(response.organizationId, response);
    await organizationCacheService.setBySlug(slug, response);
    return response;
  }

  async listOrganizations(
    queryInput: unknown,
    actor: OrganizationLookupActorContext,
  ): Promise<OrganizationLookupListResult> {
    this.ensureReadPermission(actor);

    const cached = await organizationCacheService.getList(queryInput);
    if (cached) {
      return cached;
    }

    const query = validateOrganizationQuery(queryInput ?? {});
    const result = await organizationRepository.list({
      page: query.page,
      limit: query.limit,
      search: query.search,
      slug: query.slug,
      includeDeleted: query.includeDeleted,
    });

    const response = {
      data: result.data.map(mapOrganizationToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    await organizationCacheService.setList(queryInput, response);
    return response;
  }
}

export const organizationLookupService = new OrganizationLookupService();
