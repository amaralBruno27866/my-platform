import { describe, expect, it } from "vitest";
import {
  validateCreateOrganizationInput,
  validateUpdateOrganizationInput,
} from "../validators/organization-form.validator";

describe("organization validators", () => {
  it("validates required create fields", () => {
    const errors = validateCreateOrganizationInput({
      organizationName: "",
      legalName: "",
      acronym: "",
      organizationLogo: "",
      organizationWebsite: "",
      representativeName: "",
    });

    expect(errors).toContain("organizationName is required");
    expect(errors).toContain("legalName is required");
    expect(errors).toContain("acronym is required");
    expect(errors).toContain("organizationLogo is required");
    expect(errors).toContain("organizationWebsite is required");
    expect(errors).toContain("representativeName is required");
  });

  it("accepts valid create payload", () => {
    const errors = validateCreateOrganizationInput({
      organizationName: "Org",
      legalName: "Org Inc.",
      acronym: "ORG",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "Admin",
    });

    expect(errors).toEqual([]);
  });

  it("requires at least one update field", () => {
    expect(validateUpdateOrganizationInput({})).toEqual([
      "At least one field is required for update",
    ]);
  });

  it("accepts update payload with any field", () => {
    expect(
      validateUpdateOrganizationInput({ organizationName: "Updated" }),
    ).toEqual([]);
  });
});
