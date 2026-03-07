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

  it("handles case-insensitive email on signup and login", async () => {
    await request(app).post("/public/auth/signup").send({
      firstName: "Case",
      lastName: "Test",
      email: "CaSe@MaIl.CoM",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    const loginLower = await request(app).post("/public/auth/login").send({
      email: "case@mail.com",
      password: "12345678",
    });

    expect(loginLower.status).toBe(200);
    expect(loginLower.body.account.email).toBe("case@mail.com");

    const loginUpper = await request(app).post("/public/auth/login").send({
      email: "CASE@MAIL.COM",
      password: "12345678",
    });

    expect(loginUpper.status).toBe(200);
  });

  it("rejects malformed authorization headers", async () => {
    await request(app).post("/public/auth/signup").send({
      firstName: "Auth",
      lastName: "Test",
      email: "auth-test@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    const login = await request(app).post("/public/auth/login").send({
      email: "auth-test@mail.com",
      password: "12345678",
    });

    const validToken = login.body.accessToken;

    // lowercase bearer (should fail)
    const lowercase = await request(app)
      .get("/private/auth/me")
      .set("authorization", `bearer ${validToken}`);
    expect(lowercase.status).toBe(401);

    // no space after Bearer (should fail)
    const noSpace = await request(app)
      .get("/private/auth/me")
      .set("authorization", `Bearer${validToken}`);
    expect(noSpace.status).toBe(401);

    // multiple spaces between Bearer and token (should fail - strict extraction)
    const multiSpace = await request(app)
      .get("/private/auth/me")
      .set("authorization", `Bearer   ${validToken}`);
    expect(multiSpace.status).toBe(401);

    // completely invalid format (should fail)
    const invalid = await request(app)
      .get("/private/auth/me")
      .set("authorization", "NotBearer token");
    expect(invalid.status).toBe(401);

    // only Bearer without token (should fail)
    const onlyBearer = await request(app)
      .get("/private/auth/me")
      .set("authorization", "Bearer");
    expect(onlyBearer.status).toBe(401);
  });

  it("prevents duplicate email signup", async () => {
    await request(app).post("/public/auth/signup").send({
      firstName: "Duplicate",
      lastName: "Test",
      email: "duplicate@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    const duplicate = await request(app).post("/public/auth/signup").send({
      firstName: "Another",
      lastName: "User",
      email: "duplicate@mail.com",
      password: "different",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe("AUTH_EMAIL_ALREADY_IN_USE");
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/public/auth/signup").send({
      firstName: "Wrong",
      lastName: "Pass",
      email: "wrong-pass@mail.com",
      password: "correct-password",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    const badLogin = await request(app).post("/public/auth/login").send({
      email: "wrong-pass@mail.com",
      password: "wrong-password",
    });

    expect(badLogin.status).toBe(401);
    expect(badLogin.body.code).toBe("AUTH_INVALID_CREDENTIALS");
  });
});
