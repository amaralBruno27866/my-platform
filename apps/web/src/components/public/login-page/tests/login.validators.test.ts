import { describe, expect, it } from "vitest";
import { validateLoginInput } from "../validators/login-form.validator";

describe("login validators", () => {
  it("validates required fields", () => {
    const errors = validateLoginInput({ email: "", password: "" });

    expect(errors).toContain("email is required");
    expect(errors).toContain("password is required");
  });

  it("validates email format", () => {
    const errors = validateLoginInput({
      email: "invalid-email",
      password: "12345678",
    });

    expect(errors).toContain("email must be valid");
  });

  it("accepts valid login input", () => {
    const errors = validateLoginInput({
      email: "user@myplatform.local",
      password: "12345678",
    });

    expect(errors).toEqual([]);
  });
});
