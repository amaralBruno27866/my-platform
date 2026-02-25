import { beforeEach, describe, expect, it, vi } from "vitest";
import { organizationCacheService } from "../services/services-organization-cache";
import { redisCacheService } from "../../../infra/redis";

describe("organization cache service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reads and writes id/slug/list cache keys", async () => {
    vi.spyOn(redisCacheService, "getJson")
      .mockResolvedValueOnce({ organizationId: "o1" })
      .mockResolvedValueOnce({ organizationId: "o1" })
      .mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 20 });
    vi.spyOn(redisCacheService, "setJson").mockResolvedValue();
    vi.spyOn(redisCacheService, "getNumber").mockResolvedValue(3);

    await expect(organizationCacheService.getById("o1")).resolves.toMatchObject(
      {
        organizationId: "o1",
      },
    );
    await expect(
      organizationCacheService.getBySlug("slug"),
    ).resolves.toMatchObject({
      organizationId: "o1",
    });
    await expect(
      organizationCacheService.getList({ page: 1 }),
    ).resolves.toMatchObject({
      total: 0,
    });

    await organizationCacheService.setById("o1", {
      organizationId: "o1",
    } as never);
    await organizationCacheService.setBySlug("slug", {
      organizationId: "o1",
    } as never);
    await organizationCacheService.setList(
      { page: 1 },
      { data: [], total: 0, page: 1, limit: 20 },
    );

    expect(redisCacheService.setJson).toHaveBeenCalled();
  });

  it("invalidates keys and handles version fallback", async () => {
    vi.spyOn(redisCacheService, "delete").mockResolvedValue();
    vi.spyOn(redisCacheService, "getNumber").mockResolvedValueOnce(null);
    vi.spyOn(redisCacheService, "increment").mockResolvedValueOnce(null);
    vi.spyOn(redisCacheService, "setString").mockResolvedValue();
    vi.spyOn(redisCacheService, "setJson").mockResolvedValue();

    await organizationCacheService.invalidateById("o1");
    await organizationCacheService.invalidateBySlug("slug");
    await organizationCacheService.setList(
      { page: 1 },
      { data: [], total: 0, page: 1, limit: 20 },
    );
    await organizationCacheService.invalidateLists();

    expect(redisCacheService.delete).toHaveBeenCalledTimes(2);
    expect(redisCacheService.setString).toHaveBeenCalled();
  });
});
