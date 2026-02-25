import { describe, expect, it, vi } from "vitest";
import { OrganizationService } from "../services/organization.service";
import {
  OrganizationStatus,
  OrganizationView,
} from "../models/organization.types";

const sampleOrganization: OrganizationView = {
  organizationId: "org-1",
  organizationPublicId: "ORG-000001",
  organizationName: "Sample Org",
  legalName: "Sample Org Inc.",
  acronym: "SMP",
  slug: "sample-org",
  organizationLogo: "https://example.com/logo.png",
  organizationWebsite: "https://example.com",
  representativeName: "Admin",
  representativeAccountId: "acc-1",
  organizationEmail: "admin@example.com",
  organizationAddress: "Address 1",
  organizationPhone: "+1 555 111",
  organizationStatus: OrganizationStatus.ACTIVE,
  privilege: 4,
  accessModifier: 3,
  createdBy: "admin-id",
  updatedBy: "admin-id",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

describe("organization service", () => {
  it("delegates all operations to provider", async () => {
    const provider = {
      list: vi
        .fn()
        .mockResolvedValue({
          data: [sampleOrganization],
          total: 1,
          page: 1,
          limit: 20,
        }),
      getById: vi.fn().mockResolvedValue(sampleOrganization),
      getBySlug: vi.fn().mockResolvedValue(sampleOrganization),
      create: vi.fn().mockResolvedValue(sampleOrganization),
      update: vi.fn().mockResolvedValue(sampleOrganization),
      softDelete: vi
        .fn()
        .mockResolvedValue({
          ...sampleOrganization,
          deletedAt: new Date().toISOString(),
        }),
      restore: vi
        .fn()
        .mockResolvedValue({ ...sampleOrganization, deletedAt: null }),
      bulkUpdateStatus: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      bulkSoftDelete: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    };

    const service = new OrganizationService(provider as never);

    await expect(service.list({ page: 1, limit: 10 })).resolves.toEqual({
      data: [sampleOrganization],
      total: 1,
      page: 1,
      limit: 20,
    });
    await expect(service.getById("org-1")).resolves.toEqual(sampleOrganization);
    await expect(service.getBySlug("sample-org")).resolves.toEqual(
      sampleOrganization,
    );
    await expect(
      service.create({
        organizationName: "Sample Org",
        legalName: "Sample Org Inc.",
        acronym: "SMP",
        organizationLogo: "https://example.com/logo.png",
        organizationWebsite: "https://example.com",
        representativeName: "Admin",
      }),
    ).resolves.toEqual(sampleOrganization);
    await expect(
      service.update("org-1", {
        organizationStatus: OrganizationStatus.SUSPENDED,
      }),
    ).resolves.toEqual(sampleOrganization);
    await expect(service.softDelete("org-1")).resolves.toMatchObject({
      organizationId: "org-1",
    });
    await expect(service.restore("org-1")).resolves.toMatchObject({
      organizationId: "org-1",
    });
    await expect(
      service.bulkUpdateStatus({
        organizationStatus: OrganizationStatus.ACTIVE,
        applyToAll: true,
      }),
    ).resolves.toEqual({ matchedCount: 1, modifiedCount: 1 });
    await expect(service.bulkSoftDelete({ applyToAll: true })).resolves.toEqual(
      { matchedCount: 1, modifiedCount: 1 },
    );

    expect(provider.list).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(provider.getById).toHaveBeenCalledWith("org-1");
    expect(provider.getBySlug).toHaveBeenCalledWith("sample-org");
    expect(provider.update).toHaveBeenCalledWith("org-1", {
      organizationStatus: OrganizationStatus.SUSPENDED,
    });
    expect(provider.softDelete).toHaveBeenCalledWith("org-1");
    expect(provider.restore).toHaveBeenCalledWith("org-1");
    expect(provider.bulkUpdateStatus).toHaveBeenCalledWith({
      organizationStatus: OrganizationStatus.ACTIVE,
      applyToAll: true,
    });
    expect(provider.bulkSoftDelete).toHaveBeenCalledWith({ applyToAll: true });
  });
});
