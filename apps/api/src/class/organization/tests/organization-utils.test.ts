import { describe, expect, it } from "vitest";
import {
  buildOrganizationChangeSet,
  buildOrganizationPublicId,
  formatNorthAmericanPhone,
  formatOrganizationName,
  hashSensitiveValue,
  maskSensitiveOrganizationData,
  normalizeOrganizationCreateInput,
  normalizeOrganizationUpdateInput,
  sanitizePhone,
} from "../utils";
import { AccessModifier, Privilege } from "../../../common/enums";
import { OrganizationSttus } from "../enums";

function buildResponseDto() {
  return {
    organizationId: "507f191e810c19729de860ea",
    organizationPublicId: "ORG-000001",
    organizationName: "Acme",
    legalName: "Acme Legal",
    acronym: "AC",
    slug: "acme",
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: "John",
    representativeAccountId: "507f191e810c19729de860eb",
    organizationEmail: "team@example.com",
    organizationAddress: "507f191e810c19729de860ec",
    organizationPhone: "5555551212",
    organizationStatus: OrganizationSttus.ACTIVE,
    privilege: Privilege.MASTER,
    accessModifier: AccessModifier.PRIVATE,
    createdBy: "507f191e810c19729de860ed",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    updatedBy: "507f191e810c19729de860ee",
  };
}

describe("organization utils", () => {
  it("formats organization name with lowercase particles", () => {
    expect(formatOrganizationName("  acme   OF the north  ")).toBe(
      "Acme of the North",
    );
  });

  it("sanitizes and formats north american phone", () => {
    expect(sanitizePhone("+1 (555) 555-1212")).toBe("15555551212");
    expect(formatNorthAmericanPhone("5555551212")).toBe("(555) 555-1212");
    expect(formatNorthAmericanPhone("1234567")).toBe("1234567");
  });

  it("normalizes create and update inputs", () => {
    const create = normalizeOrganizationCreateInput({
      organizationName: "acme of north",
      legalName: "acme legal",
      acronym: "ac",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "john of sales",
      organizationEmail: "TEAM@EXAMPLE.COM",
      organizationPhone: "5555551212",
    });

    expect(create.organizationName).toBe("Acme of North");
    expect(create.acronym).toBe("AC");
    expect(create.organizationEmail).toBe("team@example.com");

    const update = normalizeOrganizationUpdateInput({
      organizationName: "new name",
      organizationEmail: "NEW@EXAMPLE.COM",
    });

    expect(update.organizationName).toBe("New Name");
    expect(update.organizationEmail).toBe("new@example.com");
    expect("legalName" in update).toBe(false);
  });

  it("builds public id and hashes sensitive value", () => {
    expect(
      buildOrganizationPublicId(15, {
        prefix: "ORG",
        separator: "-",
        padLength: 6,
      }),
    ).toBe("ORG-000015");

    const hashOne = hashSensitiveValue("secret");
    const hashTwo = hashSensitiveValue("secret");

    expect(hashOne).toBe(hashTwo);
    expect(hashOne).toHaveLength(64);
  });

  it("masks sensitive fields and builds changeset", () => {
    const original = buildResponseDto();
    const masked = maskSensitiveOrganizationData(original);

    expect(masked.organizationEmail).toBe("t***@example.com");
    expect(masked.organizationPhone).toContain("*");

    const updated = {
      ...original,
      organizationName: "Acme Updated",
      organizationStatus: OrganizationSttus.SUSPENDED,
    };

    const changes = buildOrganizationChangeSet(original, updated);
    expect(changes.map((item) => item.field)).toContain("organizationName");
    expect(changes.map((item) => item.field)).toContain("organizationStatus");
  });

  it("formats organization name with particle as first word", () => {
    expect(formatOrganizationName("of mice and men")).toBe("Of Mice and Men");
  });

  it("normalizes create input without optional fields", () => {
    const create = normalizeOrganizationCreateInput({
      organizationName: "acme",
      legalName: "acme legal",
      acronym: "ac",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "john",
      // No organizationEmail or organizationPhone
    });

    expect(create.organizationName).toBe("Acme");
    expect(create.organizationEmail).toBeUndefined();
    expect(create.organizationPhone).toBeUndefined();
  });

  it("normalizes update input with all undefined optional fields", () => {
    const update = normalizeOrganizationUpdateInput({
      // Empty update - should filter out undefined
    });

    const keys = Object.keys(update);
    expect(keys).toHaveLength(0);
  });

  it("masks sensitive data when email and phone are undefined", () => {
    const org = {
      ...buildResponseDto(),
      organizationEmail: undefined,
      organizationPhone: undefined,
    };

    const masked = maskSensitiveOrganizationData(org);

    expect(masked.organizationEmail).toBeUndefined();
    expect(masked.organizationPhone).toBeUndefined();
  });
});
