import { describe, expect, it } from "vitest";
import { Privilege } from "../../../common/enums";
import {
  canEditOrganizationField,
  canPerformOrganizationAction,
  canReadOrganization,
  canUpdateOrganization,
  validateOrganizationUpdateFields,
} from "../rules";

describe("organization rules", () => {
  it("allows CRUD actions only for MASTER", () => {
    expect(canPerformOrganizationAction(Privilege.MASTER, "create")).toBe(true);
    expect(canPerformOrganizationAction(Privilege.LOW, "create")).toBe(false);
    expect(canReadOrganization(Privilege.MASTER)).toBe(true);
    expect(canReadOrganization(Privilege.HIGH)).toBe(false);
  });

  it("validates editable fields", () => {
    expect(canEditOrganizationField("organizationName")).toBe(true);
    expect(canEditOrganizationField("organizationId")).toBe(false);
  });

  it("returns forbidden fields for invalid update set", () => {
    const result = validateOrganizationUpdateFields([
      "organizationName",
      "organizationId",
      "createdBy",
    ]);

    expect(result.isValid).toBe(false);
    expect(result.forbiddenFields).toContain("organizationId");
    expect(result.forbiddenFields).toContain("createdBy");
  });

  it("blocks update when privilege is insufficient", () => {
    const result = canUpdateOrganization(Privilege.MEDIUM, [
      "organizationName",
    ]);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("INSUFFICIENT_PRIVILEGE");
  });

  it("blocks update when forbidden fields are requested", () => {
    const result = canUpdateOrganization(Privilege.MASTER, ["organizationId"]);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("FORBIDDEN_FIELDS");
    expect(result.forbiddenFields).toContain("organizationId");
  });

  it("allows update with valid fields and MASTER privilege", () => {
    const result = canUpdateOrganization(Privilege.MASTER, [
      "organizationName",
      "organizationEmail",
    ]);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});
