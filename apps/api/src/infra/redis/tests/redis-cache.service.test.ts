import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedisCacheService } from "../cache/redis-cache.service";
import * as redisClientModule from "../client";

describe("redis cache service", () => {
  const service = new RedisCacheService();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles missing client gracefully", async () => {
    vi.spyOn(redisClientModule, "getRedisClient").mockResolvedValue(null);

    await expect(service.getString("k")).resolves.toBeNull();
    await expect(service.getJson("k")).resolves.toBeNull();
    await expect(service.setString("k", "v")).resolves.toBeUndefined();
    await expect(service.delete("k")).resolves.toBeUndefined();
    await expect(service.increment("k")).resolves.toBeNull();
  });

  it("executes cache operations and fallback branches", async () => {
    const fakeClient = {
      get: vi
        .fn()
        .mockResolvedValueOnce("value")
        .mockResolvedValueOnce('{"a":1}')
        .mockResolvedValueOnce("bad-json")
        .mockResolvedValueOnce("10")
        .mockResolvedValueOnce("bad-number")
        .mockRejectedValueOnce(new Error("get-error")),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      incr: vi.fn().mockResolvedValue(2),
    };

    vi.spyOn(redisClientModule, "getRedisClient").mockResolvedValue(
      fakeClient as never,
    );

    await expect(service.getString("k")).resolves.toBe("value");
    await expect(service.getJson<{ a: number }>("k")).resolves.toEqual({
      a: 1,
    });
    await expect(service.getJson("k")).resolves.toBeNull();

    await service.setString("k", "v", 30);
    await service.setString("k", "v");
    await service.setJson("k", { x: 1 }, 15);
    await service.delete("k");
    await expect(service.increment("k")).resolves.toBe(2);
    await expect(service.getNumber("k")).resolves.toBe(10);
    await expect(service.getNumber("k")).resolves.toBeNull();
    await expect(service.getString("k")).resolves.toBeNull();

    expect(fakeClient.set).toHaveBeenCalled();
    expect(fakeClient.del).toHaveBeenCalledWith("k");
    expect(fakeClient.incr).toHaveBeenCalledWith("k");
  });
});
