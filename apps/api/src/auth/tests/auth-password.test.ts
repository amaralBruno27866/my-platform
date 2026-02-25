import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("auth password", () => {
  it("hashes and verifies", () => {
    const hashed = hashPassword("password-123");

    expect(hashed.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("password-123", hashed)).toBe(true);
    expect(verifyPassword("wrong", hashed)).toBe(false);
  });

  it("returns false for malformed encoded payload", () => {
    expect(verifyPassword("x", "bad-format")).toBe(false);
  });
});
