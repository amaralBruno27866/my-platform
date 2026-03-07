import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { signAccessToken, verifyAccessToken } from "../token";
import { env } from "../../config/env";

describe("auth token", () => {
  it("signs and verifies access token", () => {
    const token = signAccessToken({
      sub: "acc-1",
      accountPublicId: "ACC-0000001",
      email: "a@b.com",
      privilege: 1,
      accessModifier: 3,
      accountStatus: 2,
      organizationId: "org-1",
    });

    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("acc-1");
    expect(payload.email).toBe("a@b.com");
  });

  it("rejects invalid token", () => {
    expect(() => verifyAccessToken("invalid-token")).toThrow(
      "Invalid or expired token",
    );
  });

  it("rejects token with invalid decoded payload shape", () => {
    const verifySpy = vi.spyOn(jwt, "verify").mockReturnValue("bad" as never);

    expect(() => verifyAccessToken("synthetic-token")).toThrow(
      "Invalid or expired token",
    );

    verifySpy.mockRestore();
  });

  it("rejects expired token", async () => {
    const expiredToken = jwt.sign(
      {
        sub: "acc-1",
        accountPublicId: "ACC-0000001",
        email: "expired@mail.com",
        privilege: 1,
        accessModifier: 3,
        accountStatus: 2,
        organizationId: "org-1",
      },
      env.authJwtSecret,
      {
        algorithm: "HS256",
        expiresIn: "1ms",
      },
    );

    // Wait for token to expire
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(() => verifyAccessToken(expiredToken)).toThrow(
      "Invalid or expired token",
    );
  });

  it("rejects token signed with wrong secret", () => {
    const wrongToken = jwt.sign(
      {
        sub: "acc-1",
        accountPublicId: "ACC-0000001",
        email: "wrong@mail.com",
        privilege: 1,
        accessModifier: 3,
        accountStatus: 2,
        organizationId: "org-1",
      },
      "wrong-secret-key-different-from-actual",
      {
        algorithm: "HS256",
        expiresIn: "15m",
      },
    );

    expect(() => verifyAccessToken(wrongToken)).toThrow(
      "Invalid or expired token",
    );
  });

  it("rejects token with wrong algorithm", () => {
    const wrongAlgoToken = jwt.sign(
      {
        sub: "acc-1",
        accountPublicId: "ACC-0000001",
        email: "wrong-algo@mail.com",
        privilege: 1,
        accessModifier: 3,
        accountStatus: 2,
        organizationId: "org-1",
      },
      env.authJwtSecret,
      {
        algorithm: "HS512", // Wrong algorithm
        expiresIn: "15m",
      },
    );

    expect(() => verifyAccessToken(wrongAlgoToken)).toThrow(
      "Invalid or expired token",
    );
  });
});
