import { describe, expect, it } from "vitest";
import { validateLoginInput, validateSignupInput } from "../validators";

describe("auth validators", () => {
  it("validates and normalizes signup", () => {
    const payload = validateSignupInput({
      firstName: " John ",
      lastName: " Doe ",
      email: " JOHN@MAIL.COM ",
      cellphone: "(416) 555-1212",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 2,
      organizationId: " org-1 ",
    });

    expect(payload.firstName).toBe("John");
    expect(payload.lastName).toBe("Doe");
    expect(payload.email).toBe("john@mail.com");
    expect(payload.organizationId).toBe("org-1");
  });

  it("throws for invalid signup payloads", () => {
    expect(() => validateSignupInput(null)).toThrow("Invalid signup payload");
    expect(() => validateSignupInput({})).toThrow("firstName is required");
    expect(() =>
      validateSignupInput({
        firstName: "A",
      }),
    ).toThrow("lastName is required");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
      }),
    ).toThrow("email is required");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
        email: "a@a.com",
        password: "12345678",
        acceptanceTerm: true,
        accountGroup: 1,
      }),
    ).toThrow("organizationId is required");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
        email: "a@a.com",
        password: "123",
        acceptanceTerm: true,
        accountGroup: 1,
        organizationId: "o",
      }),
    ).toThrow("password must be at least 8 characters");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
        email: "a@a.com",
        password: "12345678",
        acceptanceTerm: false,
        accountGroup: 1,
        organizationId: "o",
      }),
    ).toThrow("acceptanceTerm must be true");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
        email: "a@a.com",
        password: "12345678",
        acceptanceTerm: true,
        accountGroup: 1.1,
        organizationId: "o",
      }),
    ).toThrow("accountGroup must be an integer");
    expect(() =>
      validateSignupInput({
        firstName: "A",
        lastName: "B",
        email: "a@a.com",
        password: "12345678",
        acceptanceTerm: true,
        accountGroup: 1,
        organizationId: "o",
        cellphone: "123",
      }),
    ).toThrow("cellphone must follow format (XXX) XXX-XXXX");
  });

  it("validates login payload", () => {
    const payload = validateLoginInput({ email: " A@B.COM ", password: "p" });

    expect(payload.email).toBe("a@b.com");
    expect(payload.password).toBe("p");
    expect(() => validateLoginInput(null)).toThrow("Invalid login payload");
    expect(() => validateLoginInput({ email: "a" })).toThrow(
      "email and password are required",
    );
  });
});
