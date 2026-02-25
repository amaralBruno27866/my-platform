import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "./app";
import { startTestMongo, stopTestMongo } from "./tests/mongo-memory";

describe("app routes", () => {
  beforeAll(async () => {
    await startTestMongo();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  it("returns root status", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("api");
  });

  it("returns health status with mongo state", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.mongo).toBe("connected");
    expect(typeof response.body.uptime).toBe("number");
    expect(response.body.timestamp).toBeDefined();
  });
});
