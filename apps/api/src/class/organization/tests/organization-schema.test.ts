import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { AccessModifier, Privilege } from "../../../common/enums";
import { OrganizationSttus } from "../enums";
import { OrganizationModel } from "../schemas";

describe("organization schema", () => {
  it("applies setters, defaults and enum constraints", async () => {
    const doc = new OrganizationModel({
      organizationPublicId: "ORG-000010",
      organizationName: "city of toronto",
      legalName: "ministry of health",
      acronym: "cto",
      slug: "city-of-toronto",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "john of the valley",
      representativeAccountId: new Types.ObjectId(),
      organizationEmail: "CONTACT@EXAMPLE.COM",
      createdBy: new Types.ObjectId(),
      privilege: Privilege.MASTER,
      accessModifier: AccessModifier.PRIVATE,
      organizationStatus: OrganizationSttus.ACTIVE,
    });

    expect(doc.organizationName).toBe("City of Toronto");
    expect(doc.legalName).toBe("Ministry of Health");
    expect(doc.representativeName).toBe("John of the Valley");
    expect(doc.organizationEmail).toBe("contact@example.com");
    expect(doc.acronym).toBe("CTO");
    expect(doc.deletedAt).toBeNull();
    expect(doc.organizationId).toBeTruthy();

    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it("rejects invalid enum values", async () => {
    const doc = new OrganizationModel({
      organizationPublicId: "ORG-000011",
      organizationName: "sample org",
      legalName: "sample legal",
      acronym: "smp",
      slug: "sample-org",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "john doe",
      createdBy: new Types.ObjectId(),
      privilege: 999,
      accessModifier: 999,
      organizationStatus: 999,
    });

    await expect(doc.validate()).rejects.toBeTruthy();
  });
});
