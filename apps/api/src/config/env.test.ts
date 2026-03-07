import { describe, expect, it } from "vitest";
import { env } from "./env";

describe("env config security", () => {
  it("loads AUTH_JWT_SECRET from environment", () => {
    // This test validates that AUTH_JWT_SECRET is loaded from the test setup
    // In production, the module will throw at import time if AUTH_JWT_SECRET is missing or invalid
    expect(env.authJwtSecret).toBeDefined();
    expect(env.authJwtSecret.length).toBeGreaterThanOrEqual(32);
  });

  it("loads MONGO_URI from environment", () => {
    // This test validates that MONGO_URI is loaded from the test setup
    // In production, the module will throw at import time if MONGO_URI is missing
    expect(env.mongoUri).toBeDefined();
    expect(env.mongoUri).toContain("mongodb://");
  });

  it("has secure defaults for JWT expiration", () => {
    expect(env.authJwtExpiresIn).toBeDefined();
  });

  it("has Redis configuration", () => {
    expect(env.redisUrl).toBeDefined();
    expect(env.redisAuthSessionTtlSeconds).toBeGreaterThan(0);
  });
});
