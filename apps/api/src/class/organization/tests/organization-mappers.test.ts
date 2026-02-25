import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { AccessModifier, Privilege } from "../../../common/enums";
import {
  mapOrganizationCreateToPersistence,
  mapOrganizationToResponse,
  mapOrganizationUpdateToPersistence,
} from "../mappers";
import { OrganizationSttus } from "../enums";

describe("organization mappers", () => {
  it("maps create dto to persistence payload", () => {
    const createdBy = new Types.ObjectId().toString();
    const payload = mapOrganizationCreateToPersistence(
      {
        organizationName: "My Org",
        legalName: "My Org Legal",
        acronym: "ORG",
        organizationLogo: "https://example.com/logo.png",
        organizationWebsite: "https://example.com",
        representativeName: "Jane Doe",
        organizationEmail: "team@example.com",
        organizationPhone: "+1 (555) 555-1212",
      },
      {
        createdBy,
        organizationPublicId: "ORG-000123",
      },
    );

    expect(payload.organizationPublicId).toBe("ORG-000123");
    expect(payload.slug).toBe("my-org");
    expect(payload.createdBy).toBeInstanceOf(Types.ObjectId);
  });

  it("maps update dto and auto-generates slug from organizationName", () => {
    const payload = mapOrganizationUpdateToPersistence(
      {
        organizationName: "New Name",
        representativeAccountId: "507f191e810c19729de860ea",
      },
      { updatedBy: "507f191e810c19729de860eb" },
    );

    expect(payload.slug).toBe("new-name");
    expect(payload.representativeAccountId).toBeInstanceOf(Types.ObjectId);
    expect(payload.updatedBy).toBeInstanceOf(Types.ObjectId);
  });

  it("maps internal document to response dto with string ids", () => {
    const organizationId = new Types.ObjectId();
    const createdBy = new Types.ObjectId();
    const updatedBy = new Types.ObjectId();

    const response = mapOrganizationToResponse({
      _id: new Types.ObjectId(),
      organizationId,
      organizationPublicId: "ORG-000999",
      organizationName: "Org",
      legalName: "Org Legal",
      acronym: "ORG",
      slug: "org",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "John",
      representativeAccountId: undefined,
      organizationEmail: "team@example.com",
      organizationAddress: undefined,
      organizationPhone: "+1 555 555 1212",
      organizationStatus: OrganizationSttus.ACTIVE,
      deletedAt: null,
      createdBy,
      updatedBy,
      privilege: Privilege.MASTER,
      accessModifier: AccessModifier.PRIVATE,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });

    expect(response.organizationId).toBe(organizationId.toString());
    expect(response.createdBy).toBe(createdBy.toString());
    expect(response.updatedBy).toBe(updatedBy.toString());
  });
});
