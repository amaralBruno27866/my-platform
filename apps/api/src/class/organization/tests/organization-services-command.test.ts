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
  OrganizationBadRequestError,
  OrganizationForbiddenError,
  OrganizationNotFoundError,
} from "../errors";
import { organizationRepository } from "../repositories";
import { organizationCommandService } from "../services";

function buildCreatePayload(suffix: string) {
  return {
    organizationName: `Command ${suffix}`,
    legalName: `Command Legal ${suffix}`,
    acronym: `C${suffix}`.slice(0, 3),
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: `Rep ${suffix}`,
    organizationEmail: `command-${suffix.toLowerCase()}@example.com`,
    organizationPhone: "5555551212",
  };
}

function buildActor(privilege: Privilege = Privilege.MASTER) {
  return {
    accountId: new Types.ObjectId().toString(),
    privilege,
  };
}

function buildRepositoryPayload(suffix: string) {
  return {
    organizationId: new Types.ObjectId(),
    organizationPublicId: `ORG-C${suffix}`,
    organizationName: `Repository ${suffix}`,
    legalName: `Repository Legal ${suffix}`,
    acronym: `R${suffix}`.slice(0, 3),
    slug: `repository-${suffix.toLowerCase()}`,
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: `Rep ${suffix}`,
    organizationEmail: `repo-${suffix.toLowerCase()}@example.com`,
    organizationPhone: "+1 (555) 555-1212",
    organizationStatus: OrganizationSttus.ACTIVE,
    createdBy: new Types.ObjectId(),
    privilege: Privilege.MASTER,
    accessModifier: AccessModifier.PRIVATE,
    deletedAt: null,
  };
}

describe("organization command service", () => {
  beforeAll(async () => {
    await startTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  it("creates organization with master privilege", async () => {
    const result = await organizationCommandService.createOrganization(
      buildCreatePayload("A"),
      buildActor(Privilege.MASTER),
    );

    expect(result.organizationId).toBeDefined();
    expect(result.organizationPublicId.startsWith("ORG-")).toBe(true);
  });

  it("rejects create with insufficient privilege", async () => {
    await expect(
      organizationCommandService.createOrganization(
        buildCreatePayload("B"),
        buildActor(Privilege.LOW),
      ),
    ).rejects.toBeInstanceOf(OrganizationForbiddenError);
  });

  it("rejects update when organization does not exist", async () => {
    await expect(
      organizationCommandService.updateOrganization(
        new Types.ObjectId().toString(),
        { organizationName: "New Name" },
        buildActor(),
      ),
    ).rejects.toBeInstanceOf(OrganizationNotFoundError);
  });

  it("rejects soft delete and restore when organization does not exist", async () => {
    const id = new Types.ObjectId().toString();

    await expect(
      organizationCommandService.softDeleteOrganization(id, buildActor()),
    ).rejects.toBeInstanceOf(OrganizationNotFoundError);

    await expect(
      organizationCommandService.restoreOrganization(id, buildActor()),
    ).rejects.toBeInstanceOf(OrganizationNotFoundError);
  });

  it("rejects restricted operations for non-master users", async () => {
    // Create org with MASTER
    const created = await organizationCommandService.createOrganization(
      buildCreatePayload("Restricted"),
      buildActor(Privilege.MASTER),
    );
    const id = created.organizationId;

    // HIGH can update HIGH_EDITABLE fields
    const updated = await organizationCommandService.updateOrganization(
      id,
      { acronym: "RES" },
      buildActor(Privilege.HIGH),
    );
    expect(updated.acronym).toBe("RES");

    // HIGH cannot update MASTER_ONLY fields
    await expect(
      organizationCommandService.updateOrganization(
        id,
        { organizationStatus: OrganizationSttus.SUSPENDED },
        buildActor(Privilege.HIGH),
      ),
    ).rejects.toBeInstanceOf(OrganizationBadRequestError);

    // HIGH cannot create
    await expect(
      organizationCommandService.createOrganization(
        buildCreatePayload("Create"),
        buildActor(Privilege.HIGH),
      ),
    ).rejects.toBeInstanceOf(OrganizationForbiddenError);

    // HIGH cannot bulk update status
    await expect(
      organizationCommandService.bulkUpdateOrganizationStatus(
        {
          organizationIds: [id],
          organizationStatus: OrganizationSttus.SUSPENDED,
        },
        buildActor(Privilege.HIGH),
      ),
    ).rejects.toBeInstanceOf(OrganizationForbiddenError);

    // HIGH cannot bulk soft delete
    await expect(
      organizationCommandService.bulkSoftDeleteOrganizations(
        {
          organizationIds: [id],
        },
        buildActor(Privilege.HIGH),
      ),
    ).rejects.toBeInstanceOf(OrganizationForbiddenError);
  });

  it("updates, soft deletes, restores and executes bulk operations", async () => {
    const first = await organizationRepository.create(
      buildRepositoryPayload("X1"),
    );
    const second = await organizationRepository.create(
      buildRepositoryPayload("X2"),
    );

    const updated = await organizationCommandService.updateOrganization(
      first.organizationId.toString(),
      { organizationName: "Repository Updated" },
      buildActor(),
    );

    expect(updated.organizationName).toBe("Repository Updated");

    const deleted = await organizationCommandService.softDeleteOrganization(
      first.organizationId.toString(),
      buildActor(),
    );
    expect(deleted.deletedAt).not.toBeNull();

    const restored = await organizationCommandService.restoreOrganization(
      first.organizationId.toString(),
      buildActor(),
    );
    expect(restored.deletedAt).toBeNull();

    const bulkStatus =
      await organizationCommandService.bulkUpdateOrganizationStatus(
        {
          organizationIds: [
            first.organizationId.toString(),
            second.organizationId.toString(),
          ],
          organizationStatus: OrganizationSttus.INACTIVE,
        },
        buildActor(),
      );

    expect(bulkStatus.matchedCount).toBe(2);

    const bulkDelete =
      await organizationCommandService.bulkSoftDeleteOrganizations(
        {
          organizationIds: [
            first.organizationId.toString(),
            second.organizationId.toString(),
          ],
        },
        buildActor(),
      );

    expect(bulkDelete.matchedCount).toBe(2);
  });
});
