import { describe, expect, it } from "vitest";
import { Privilege } from "../../../common/enums";
import {
  organizationBulkSoftDeleteSchema,
  organizationBulkUpdateStatusSchema,
  organizationCreateSchema,
  organizationImmutableFieldsSchema,
  organizationQuerySchema,
  organizationUpdateSchema,
} from "../validators";
import { OrganizationSttus } from "../enums";

describe("organization validators", () => {
  it("validates create payload with normalization helpers", () => {
    const parsed = organizationCreateSchema.parse({
      organizationName: "Acme",
      legalName: "Acme Legal",
      acronym: "ac",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "John",
      representativeAccountId: "507f191e810c19729de860ea",
      organizationEmail: "TEAM@EXAMPLE.COM",
      organizationAddress: "507f191e810c19729de860eb",
      organizationPhone: "+1 555 555 1212",
    });

    expect(parsed.acronym).toBe("AC");
    expect(parsed.organizationEmail).toBe("team@example.com");
  });

  it("rejects empty update payload", () => {
    const result = organizationUpdateSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("validates partial update payload", () => {
    const parsed = organizationUpdateSchema.parse({
      organizationName: "Acme Updated",
      organizationEmail: "NEW@EXAMPLE.COM",
    });

    expect(parsed.organizationName).toBe("Acme Updated");
    expect(parsed.organizationEmail).toBe("new@example.com");
  });

  it("parses list query defaults and coercions", () => {
    const parsed = organizationQuerySchema.parse({
      page: "2",
      limit: "10",
      includeDeleted: "true",
      privilege: Privilege.MASTER,
    });

    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(10);
    expect(parsed.includeDeleted).toBe(true);
  });

  it("validates bulk status payload with ids", () => {
    const parsed = organizationBulkUpdateStatusSchema.parse({
      organizationIds: ["507f191e810c19729de860ea"],
      organizationStatus: OrganizationSttus.SUSPENDED,
    });

    expect(parsed.organizationIds).toHaveLength(1);
    expect(parsed.organizationStatus).toBe(OrganizationSttus.SUSPENDED);
  });

  it("rejects bulk status payload without ids and applyToAll=false", () => {
    const result = organizationBulkUpdateStatusSchema.safeParse({
      applyToAll: false,
      organizationStatus: OrganizationSttus.ACTIVE,
    });

    expect(result.success).toBe(false);
  });

  it("validates bulk soft delete payload with applyToAll=true", () => {
    const parsed = organizationBulkSoftDeleteSchema.parse({
      applyToAll: true,
    });

    expect(parsed.applyToAll).toBe(true);
  });

  it("rejects immutable field updates", () => {
    const result = organizationImmutableFieldsSchema.safeParse([
      "organizationName",
      "organizationId",
    ]);

    expect(result.success).toBe(false);
  });
});
