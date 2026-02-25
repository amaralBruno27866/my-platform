import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { signAccessToken, verifyAccessToken } from "../token";

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
});
