import { describe, expect, it, vi } from "vitest";
import { getRedisHealth } from "../health/redis-health";
import * as redisClientModule from "../client";

describe("redis health", () => {
  it("returns state from redis client module", () => {
    vi.spyOn(redisClientModule, "getRedisConnectionState").mockReturnValue(
      "ready",
    );

    expect(getRedisHealth()).toEqual({ state: "ready" });
  });
});
