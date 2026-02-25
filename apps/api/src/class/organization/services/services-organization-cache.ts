import { env } from "../../../config/env";
import { redisCacheService } from "../../../infra/redis";
import { IOrganizationResponseDTO } from "../interfaces";
import { OrganizationLookupListResult } from "./services-organization-lookup";

const ORGANIZATION_CACHE_PREFIX = "organization";
const ORGANIZATION_LIST_VERSION_KEY = `${ORGANIZATION_CACHE_PREFIX}:list:version`;

function byIdKey(id: string): string {
  return `${ORGANIZATION_CACHE_PREFIX}:id:${id}`;
}

function bySlugKey(slug: string): string {
  return `${ORGANIZATION_CACHE_PREFIX}:slug:${slug}`;
}

function listKey(version: number, queryKey: string): string {
  return `${ORGANIZATION_CACHE_PREFIX}:list:v${version}:${queryKey}`;
}

function normalizeListQueryKey(queryInput: unknown): string {
  return JSON.stringify(queryInput ?? {});
}

export class OrganizationCacheService {
  private readonly ttlSeconds = env.redisOrganizationCacheTtlSeconds;

  async getById(id: string): Promise<IOrganizationResponseDTO | null> {
    return redisCacheService.getJson<IOrganizationResponseDTO>(byIdKey(id));
  }

  async setById(id: string, value: IOrganizationResponseDTO): Promise<void> {
    await redisCacheService.setJson(byIdKey(id), value, this.ttlSeconds);
  }

  async getBySlug(slug: string): Promise<IOrganizationResponseDTO | null> {
    return redisCacheService.getJson<IOrganizationResponseDTO>(bySlugKey(slug));
  }

  async setBySlug(
    slug: string,
    value: IOrganizationResponseDTO,
  ): Promise<void> {
    await redisCacheService.setJson(bySlugKey(slug), value, this.ttlSeconds);
  }

  async getList(
    queryInput: unknown,
  ): Promise<OrganizationLookupListResult | null> {
    const version = await this.getListVersion();
    return redisCacheService.getJson<OrganizationLookupListResult>(
      listKey(version, normalizeListQueryKey(queryInput)),
    );
  }

  async setList(
    queryInput: unknown,
    value: OrganizationLookupListResult,
  ): Promise<void> {
    const version = await this.getListVersion();
    await redisCacheService.setJson(
      listKey(version, normalizeListQueryKey(queryInput)),
      value,
      this.ttlSeconds,
    );
  }

  async invalidateById(id: string): Promise<void> {
    await redisCacheService.delete(byIdKey(id));
  }

  async invalidateBySlug(slug: string): Promise<void> {
    await redisCacheService.delete(bySlugKey(slug));
  }

  async invalidateLists(): Promise<void> {
    await this.bumpListVersion();
  }

  private async getListVersion(): Promise<number> {
    const version = await redisCacheService.getNumber(
      ORGANIZATION_LIST_VERSION_KEY,
    );
    return version ?? 1;
  }

  private async bumpListVersion(): Promise<void> {
    const next = await redisCacheService.increment(
      ORGANIZATION_LIST_VERSION_KEY,
    );

    if (next === null) {
      await redisCacheService.setString(ORGANIZATION_LIST_VERSION_KEY, "1");
    }
  }
}

export const organizationCacheService = new OrganizationCacheService();
