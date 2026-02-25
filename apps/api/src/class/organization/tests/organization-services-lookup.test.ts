import { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AccessModifier, Privilege } from "../../../common/enums";
import {
  clearTestMongo,
  startTestMongo,
  stopTestMongo,
} from "../../../tests/mongo-memory";
import { OrganizationSttus } from "../enums";
import {
  OrganizationForbiddenError,
  OrganizationNotFoundError,
} from "../errors";
import { organizationRepository } from "../repositories";
import { organizationLookupService } from "../services";

function buildOrganizationPayload(suffix: string) {
  return {
    organizationId: new Types.ObjectId(),
    organizationPublicId: `ORG-L${suffix}`,
    organizationName: `Lookup ${suffix}`,
    legalName: `Lookup Legal ${suffix}`,
    acronym: `L${suffix}`.slice(0, 3),
    slug: `lookup-${suffix.toLowerCase()}`,
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: `Representative ${suffix}`,
    organizationEmail: `lookup-${suffix.toLowerCase()}@example.com`,
    organizationPhone: "+1 (555) 555-1212",
    organizationStatus: OrganizationSttus.ACTIVE,
    createdBy: new Types.ObjectId(),
    privilege: Privilege.MASTER,
    accessModifier: AccessModifier.PRIVATE,
    deletedAt: null,
  };
}

describe("organization lookup service", () => {
  beforeAll(async () => {
    await startTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  it("rejects read when privilege is insufficient", async () => {
    await expect(
      organizationLookupService.listOrganizations(
        {},
        { privilege: Privilege.LOW },
      ),
    ).rejects.toBeInstanceOf(OrganizationForbiddenError);
  });

  it("gets organization by id", async () => {
    const created = await organizationRepository.create(
      buildOrganizationPayload("A"),
    );

    const result = await organizationLookupService.getOrganizationById(
      created.organizationId.toString(),
      { privilege: Privilege.MASTER },
    );

    expect(result.organizationId).toBe(created.organizationId.toString());
  });

  it("gets organization by slug", async () => {
    const created = await organizationRepository.create(
      buildOrganizationPayload("B"),
    );

    const result = await organizationLookupService.getOrganizationBySlug(
      created.slug,
      {
        privilege: Privilege.MASTER,
      },
    );

    expect(result.slug).toBe(created.slug);
  });

  it("throws not found for missing organization", async () => {
    await expect(
      organizationLookupService.getOrganizationBySlug("missing-slug", {
        privilege: Privilege.MASTER,
      }),
    ).rejects.toBeInstanceOf(OrganizationNotFoundError);
  });

  it("lists organizations with parsed query input", async () => {
    await organizationRepository.create(buildOrganizationPayload("C1"));
    await organizationRepository.create(buildOrganizationPayload("C2"));

    const result = await organizationLookupService.listOrganizations(
      {
        page: "1",
        limit: "1",
      },
      { privilege: Privilege.MASTER },
    );

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it("propagates validation errors for invalid query", async () => {
    await expect(
      organizationLookupService.listOrganizations(
        { limit: 2000 },
        { privilege: Privilege.MASTER },
      ),
    ).rejects.toBeInstanceOf(Error);
  });
});
