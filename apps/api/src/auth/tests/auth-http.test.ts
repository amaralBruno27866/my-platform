import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authRouter } from "../controllers";
import { authStore } from "../store";

function resetAuthStore(): void {
  const mutableStore = authStore as unknown as {
    sequence: number;
    byId: Map<string, unknown>;
    byEmail: Map<string, unknown>;
  };

  mutableStore.sequence = 1;
  mutableStore.byId.clear();
  mutableStore.byEmail.clear();
}

describe("auth http routes", () => {
  const app = express();
  app.use(express.json());
  app.use(authRouter);

  beforeEach(() => {
    resetAuthStore();
  });

  it("signup/login/me happy path", async () => {
    const signup = await request(app).post("/public/auth/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john-http@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    expect(signup.status).toBe(201);

    const login = await request(app).post("/public/auth/login").send({
      email: "john-http@mail.com",
      password: "12345678",
    });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();

    const me = await request(app)
      .get("/private/auth/me")
      .set("authorization", `Bearer ${login.body.accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.email).toBe("john-http@mail.com");
  });

  it("handles route errors", async () => {
    const badSignup = await request(app).post("/public/auth/signup").send({});
    expect(badSignup.status).toBe(400);

    const badLogin = await request(app).post("/public/auth/login").send({});
    expect(badLogin.status).toBe(400);

    const noToken = await request(app).get("/private/auth/me");
    expect(noToken.status).toBe(401);

    const emptyBearer = await request(app)
      .get("/private/auth/me")
      .set("authorization", "Bearer ");
    expect(emptyBearer.status).toBe(401);
  });

  it("returns unauthorized for inactive session", async () => {
    await request(app).post("/public/auth/signup").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane-http@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    const login = await request(app).post("/public/auth/login").send({
      email: "jane-http@mail.com",
      password: "12345678",
    });

    vi.spyOn(authStore, "ensureTokenIsActive").mockResolvedValue(false);

    const me = await request(app)
      .get("/private/auth/me")
      .set("authorization", `Bearer ${login.body.accessToken}`);

    expect(me.status).toBe(401);
  });
});
