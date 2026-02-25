import { describe, expect, it, vi } from "vitest";
import { OrganizationState } from "../state/organization.state";
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

describe("organization state", () => {
  it("loads data and updates snapshot", async () => {
    const service = {
      list: vi
        .fn()
        .mockResolvedValue({
          data: [sampleOrganization],
          total: 1,
          page: 2,
          limit: 5,
        }),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
      bulkUpdateStatus: vi.fn(),
      bulkSoftDelete: vi.fn(),
    };

    const state = new OrganizationState(service as never);
    const result = await state.load({ page: 2, limit: 5 });

    expect(result.total).toBe(1);
    expect(state.value.items).toHaveLength(1);
    expect(state.value.page).toBe(2);
    expect(state.value.limit).toBe(5);
    expect(state.value.loading).toBe(false);
  });

  it("handles load failures for Error and unknown values", async () => {
    const errorService = {
      list: vi.fn().mockRejectedValue(new Error("boom")),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      restore: vi.fn(),
      bulkUpdateStatus: vi.fn(),
      bulkSoftDelete: vi.fn(),
    };

    const stateWithError = new OrganizationState(errorService as never);
    await expect(stateWithError.load()).rejects.toThrow("boom");
    expect(stateWithError.value.error).toBe("boom");

    const unknownErrorService = {
      ...errorService,
      list: vi.fn().mockRejectedValue("string-error"),
    };

    const stateWithUnknown = new OrganizationState(
      unknownErrorService as never,
    );
    await expect(stateWithUnknown.load()).rejects.toBe("string-error");
    expect(stateWithUnknown.value.error).toBe("Unexpected error");
  });

  it("selects and mutates entities through service operations", async () => {
    const service = {
      list: vi
        .fn()
        .mockResolvedValue({
          data: [sampleOrganization],
          total: 1,
          page: 1,
          limit: 20,
        }),
      getById: vi.fn().mockResolvedValue(sampleOrganization),
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

    const state = new OrganizationState(service as never);

    await expect(state.selectById("org-1")).resolves.toEqual(
      sampleOrganization,
    );
    expect(state.value.selected?.organizationId).toBe("org-1");

    await state.create({
      organizationName: "New Org",
      legalName: "New Org Inc.",
      acronym: "NEW",
      organizationLogo: "https://example.com/new.png",
      organizationWebsite: "https://new.example.com",
      representativeName: "Owner",
    });
    await state.update("org-1", {
      organizationStatus: OrganizationStatus.INACTIVE,
    });
    await state.softDelete("org-1");
    await state.restore("org-1");
    await state.bulkUpdateStatus({
      organizationStatus: OrganizationStatus.SUSPENDED,
      includeDeleted: true,
      applyToAll: true,
    });
    await state.bulkSoftDelete({ applyToAll: true, includeDeleted: false });

    expect(service.getById).toHaveBeenCalledWith("org-1");
    expect(service.create).toHaveBeenCalled();
    expect(service.update).toHaveBeenCalledWith("org-1", {
      organizationStatus: OrganizationStatus.INACTIVE,
    });
    expect(service.softDelete).toHaveBeenCalledWith("org-1");
    expect(service.restore).toHaveBeenCalledWith("org-1");
    expect(service.bulkUpdateStatus).toHaveBeenCalledWith({
      organizationStatus: OrganizationStatus.SUSPENDED,
      includeDeleted: true,
      applyToAll: true,
    });
    expect(service.bulkSoftDelete).toHaveBeenCalledWith({
      applyToAll: true,
      includeDeleted: false,
    });
    expect(service.list).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      includeDeleted: false,
    });
  });
});
