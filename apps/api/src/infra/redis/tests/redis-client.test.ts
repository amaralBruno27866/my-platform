import { beforeEach, describe, expect, it, vi } from "vitest";

describe("redis client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.REDIS_ENABLED;
  });

  it("returns disabled state when feature is off", async () => {
    vi.resetModules();
    process.env.REDIS_ENABLED = "false";

    const module = await import("../client/redis-client");

    await expect(module.getRedisClient()).resolves.toBeNull();
    expect(module.getRedisConnectionState()).toBe("disabled");
  });

  it("connects when enabled and client is available", async () => {
    vi.resetModules();
    process.env.REDIS_ENABLED = "true";

    vi.doMock("ioredis", () => {
      return {
        default: class MockRedis {
          status = "wait";
          constructor(_url: string, _options: unknown) {}
          on() {
            return this;
          }
          async connect() {
            this.status = "ready";
          }
        },
      };
    });

    const module = await import("../client/redis-client");

    const client = await module.getRedisClient();
    expect(client).toBeTruthy();
    expect(module.getRedisConnectionState()).toBe("ready");

    const mutableClient = client as unknown as { status: string };
    mutableClient.status = "reconnecting";
    expect(module.getRedisConnectionState()).toBe("reconnecting");

    mutableClient.status = "end";
    expect(module.getRedisConnectionState()).toBe("ended");

    mutableClient.status = "connect";
    expect(module.getRedisConnectionState()).toBe("connecting");

    mutableClient.status = "wait";
    expect(module.getRedisConnectionState()).toBe("connecting");

    mutableClient.status = "weird-state";
    expect(module.getRedisConnectionState()).toBe("unknown");
  });

  it("returns null when redis connect fails", async () => {
    vi.resetModules();
    process.env.REDIS_ENABLED = "true";

    vi.doMock("ioredis", () => {
      return {
        default: class MockRedis {
          status = "wait";
          constructor(_url: string, _options: unknown) {}
          on() {
            return this;
          }
          async connect() {
            throw new Error("connect-failed");
          }
        },
      };
    });

    const module = await import("../client/redis-client");

    await expect(module.getRedisClient()).resolves.toBeNull();
    expect(module.getRedisConnectionState()).toBe("connecting");
  });
});
