import { describe, expect, it } from "vitest";
import { Privilege } from "../../../common/enums";
import {
  canPerformOrganizationAction,
  canReadOrganization,
  canUpdateOrganization,
  validateOrganizationUpdateFields,
} from "../rules";

describe("organization rules", () => {
  it("allows CRUD actions only for MASTER (with HIGH read/update)", () => {
    expect(canPerformOrganizationAction(Privilege.MASTER, "create")).toBe(true);
    expect(canPerformOrganizationAction(Privilege.LOW, "create")).toBe(false);
    expect(canReadOrganization(Privilege.MASTER)).toBe(true);
    expect(canReadOrganization(Privilege.HIGH)).toBe(true);
    expect(canPerformOrganizationAction(Privilege.HIGH, "update")).toBe(true);
    expect(canPerformOrganizationAction(Privilege.HIGH, "softDelete")).toBe(
      false,
    );
  });

  it("validates update fields based on privilege level", () => {
    // MASTER can edit all regular fields
    const masterResult = validateOrganizationUpdateFields(Privilege.MASTER, [
      "organizationName",
      "organizationEmail",
    ]);
    expect(masterResult.isValid).toBe(true);

    // HIGH can edit HIGH_EDITABLE fields
    const highResult = validateOrganizationUpdateFields(Privilege.HIGH, [
      "organizationName",
      "organizationEmail",
    ]);
    expect(highResult.isValid).toBe(true);

    // HIGH cannot edit MASTER_ONLY fields
    const highForbidden = validateOrganizationUpdateFields(Privilege.HIGH, [
      "organizationStatus",
      "privilege",
    ]);
    expect(highForbidden.isValid).toBe(false);
    expect(highForbidden.forbiddenFields).toContain("organizationStatus");
    expect(highForbidden.forbiddenFields).toContain("privilege");
  });

  it("blocks update when privilege is insufficient", () => {
    const result = canUpdateOrganization(Privilege.MEDIUM, [
      "organizationName",
    ]);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("INSUFFICIENT_PRIVILEGE");
  });

  it("blocks update when forbidden fields are requested", () => {
    // MASTER cannot edit immutable fields
    const result = canUpdateOrganization(Privilege.MASTER, ["organizationId"]);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("FORBIDDEN_FIELDS");
    expect(result.forbiddenFields).toContain("organizationId");

    // HIGH cannot edit MASTER_ONLY fields
    const highResult = canUpdateOrganization(Privilege.HIGH, [
      "organizationStatus",
    ]);
    expect(highResult.allowed).toBe(false);
    expect(highResult.reason).toBe("FORBIDDEN_FIELDS");
    expect(highResult.forbiddenFields).toContain("organizationStatus");
  });

  it("allows update with valid fields and appropriate privileges", () => {
    // MASTER with any field
    const masterResult = canUpdateOrganization(Privilege.MASTER, [
      "organizationName",
      "organizationEmail",
    ]);
    expect(masterResult.allowed).toBe(true);

    // HIGH with HIGH_EDITABLE fields
    const highResult = canUpdateOrganization(Privilege.HIGH, [
      "organizationName",
      "acronym",
    ]);
    expect(highResult.allowed).toBe(true);
  });
});
