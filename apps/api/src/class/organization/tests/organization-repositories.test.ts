import { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AccessModifier, Privilege } from "../../../common/enums";
import {
  clearTestMongo,
  startTestMongo,
  stopTestMongo,
} from "../../../tests/mongo-memory";
import { OrganizationSttus } from "../enums";
import { organizationRepository } from "../repositories";

function buildOrganizationPayload(suffix: string) {
  return {
    organizationId: new Types.ObjectId(),
    organizationPublicId: `ORG-${suffix}`,
    organizationName: `Organization ${suffix}`,
    legalName: `Organization Legal ${suffix}`,
    acronym: `O${suffix}`.slice(0, 3),
    slug: `organization-${suffix.toLowerCase()}`,
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: `Representative ${suffix}`,
    organizationEmail: `org-${suffix.toLowerCase()}@example.com`,
    organizationPhone: "+1 (555) 555-1212",
    organizationStatus: OrganizationSttus.ACTIVE,
    createdBy: new Types.ObjectId(),
    privilege: Privilege.MASTER,
    accessModifier: AccessModifier.PRIVATE,
    deletedAt: null,
  };
}

describe("organization repository", () => {
  beforeAll(async () => {
    await startTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  it("finds by id, organizationId, slug and publicId", async () => {
    const created = await organizationRepository.create(
      buildOrganizationPayload("A1"),
    );

    const byId = await organizationRepository.findById(created.organizationId);
    const byOrganizationId = await organizationRepository.findByOrganizationId(
      created.organizationId,
    );
    const bySlug = await organizationRepository.findBySlug(created.slug);
    const byPublicId = await organizationRepository.findByPublicId(
      created.organizationPublicId,
    );

    expect(byId?.organizationPublicId).toBe(created.organizationPublicId);
    expect(byOrganizationId?.organizationPublicId).toBe(
      created.organizationPublicId,
    );
    expect(bySlug?.organizationPublicId).toBe(created.organizationPublicId);
    expect(byPublicId?.organizationPublicId).toBe(created.organizationPublicId);
  });

  it("lists with pagination and slug filter", async () => {
    await organizationRepository.create(buildOrganizationPayload("B1"));
    await organizationRepository.create(buildOrganizationPayload("B2"));

    const pageOne = await organizationRepository.list({ page: 1, limit: 1 });
    const filtered = await organizationRepository.list({
      slug: "organization-b2",
      page: 1,
      limit: 10,
    });

    expect(pageOne.total).toBe(2);
    expect(pageOne.data).toHaveLength(1);
    expect(filtered.total).toBe(1);
    expect(filtered.data[0]?.slug).toBe("organization-b2");
  });

  it("updates, soft deletes and restores by organizationId", async () => {
    const created = await organizationRepository.create(
      buildOrganizationPayload("C1"),
    );

    const updated = await organizationRepository.updateById(
      created.organizationId,
      {
        organizationName: "Organization Updated",
      },
    );

    expect(updated?.organizationName).toBe("Organization Updated");

    const deleted = await organizationRepository.softDeleteById(
      created.organizationId,
      new Types.ObjectId(),
    );

    expect(deleted?.deletedAt).not.toBeNull();

    const hiddenByDefault = await organizationRepository.findById(
      created.organizationId,
    );
    const visibleWithDeleted = await organizationRepository.findById(
      created.organizationId,
      true,
    );

    expect(hiddenByDefault).toBeNull();
    expect(visibleWithDeleted?.deletedAt).not.toBeNull();

    const restored = await organizationRepository.restoreById(
      created.organizationId,
      new Types.ObjectId(),
    );

    expect(restored?.deletedAt).toBeNull();
  });

  it("runs bulk operations with organizationIds filter", async () => {
    const first = await organizationRepository.create(
      buildOrganizationPayload("D1"),
    );
    const second = await organizationRepository.create(
      buildOrganizationPayload("D2"),
    );

    const bulkStatus = await organizationRepository.bulkUpdateStatus(
      {
        organizationIds: [
          first.organizationId.toString(),
          second.organizationId.toString(),
        ],
      },
      OrganizationSttus.SUSPENDED,
      new Types.ObjectId(),
    );

    expect(bulkStatus.matchedCount).toBe(2);
    expect(bulkStatus.modifiedCount).toBe(2);

    const bulkDelete = await organizationRepository.bulkSoftDelete(
      {
        organizationIds: [
          first.organizationId.toString(),
          second.organizationId.toString(),
        ],
      },
      new Types.ObjectId(),
    );

    expect(bulkDelete.matchedCount).toBe(2);
    expect(bulkDelete.modifiedCount).toBe(2);
  });

  it("supports applyToAll and includeDeleted in bulk operations", async () => {
    const first = await organizationRepository.create(
      buildOrganizationPayload("E1"),
    );
    await organizationRepository.create(buildOrganizationPayload("E2"));

    await organizationRepository.softDeleteById(
      first.organizationId,
      new Types.ObjectId(),
    );

    const withoutDeleted = await organizationRepository.bulkUpdateStatus(
      { applyToAll: true },
      OrganizationSttus.INACTIVE,
      new Types.ObjectId(),
    );

    const withDeleted = await organizationRepository.bulkUpdateStatus(
      { applyToAll: true, includeDeleted: true },
      OrganizationSttus.ACTIVE,
      new Types.ObjectId(),
    );

    expect(withoutDeleted.matchedCount).toBe(1);
    expect(withDeleted.matchedCount).toBe(2);
  });
});
