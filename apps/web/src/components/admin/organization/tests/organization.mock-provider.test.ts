import { describe, expect, it } from "vitest";
import { OrganizationStatus } from "../models/organization.types";
import { OrganizationMockProvider } from "../mock/organization.mock-provider";

describe("organization mock provider", () => {
  it("supports list/create/update flow", async () => {
    const provider = new OrganizationMockProvider();

    const initial = await provider.list();
    const created = await provider.create({
      organizationName: "UI Org",
      legalName: "UI Org Inc.",
      acronym: "UIO",
      organizationLogo: "https://example.com/logo.png",
      organizationWebsite: "https://example.com",
      representativeName: "UI Admin",
    });

    const updated = await provider.update(created.organizationId, {
      organizationStatus: OrganizationStatus.SUSPENDED,
    });

    const after = await provider.list({ includeDeleted: true });

    expect(initial.total).toBeGreaterThanOrEqual(1);
    expect(updated.organizationStatus).toBe(OrganizationStatus.SUSPENDED);
    expect(after.total).toBe(initial.total + 1);
  });

  it("filters by slug and search", async () => {
    const provider = new OrganizationMockProvider();

    const created = await provider.create({
      organizationName: "Beta Labs",
      legalName: "Beta Labs LLC",
      acronym: "BLA",
      organizationLogo: "https://example.com/beta.png",
      organizationWebsite: "https://beta.example.com",
      representativeName: "Beta Owner",
    });

    const bySlug = await provider.list({ slug: created.slug });
    const bySearch = await provider.list({ search: "beta" });

    expect(bySlug.total).toBe(1);
    expect(bySlug.data[0].organizationId).toBe(created.organizationId);
    expect(bySearch.total).toBeGreaterThanOrEqual(1);
  });

  it("throws for unknown id and slug", async () => {
    const provider = new OrganizationMockProvider();

    await expect(provider.getById("unknown-id")).rejects.toThrow(
      "Organization not found",
    );
    await expect(provider.getBySlug("unknown-slug")).rejects.toThrow(
      "Organization not found",
    );
  });

  it("soft deletes and restores organization", async () => {
    const provider = new OrganizationMockProvider();
    const created = await provider.create({
      organizationName: "Delete Me",
      legalName: "Delete Me Ltd",
      acronym: "DEL",
      organizationLogo: "https://example.com/del.png",
      organizationWebsite: "https://del.example.com",
      representativeName: "Cleanup User",
    });

    const deleted = await provider.softDelete(created.organizationId);
    const visible = await provider.list();
    const withDeleted = await provider.list({ includeDeleted: true });
    const restored = await provider.restore(created.organizationId);

    expect(deleted.deletedAt).toBeTruthy();
    expect(
      visible.data.find(
        (item) => item.organizationId === created.organizationId,
      ),
    ).toBeUndefined();
    expect(
      withDeleted.data.find(
        (item) => item.organizationId === created.organizationId,
      ),
    ).toBeTruthy();
    expect(restored.deletedAt).toBeNull();
  });

  it("supports bulk status and bulk delete by ids and applyToAll", async () => {
    const provider = new OrganizationMockProvider();

    const first = await provider.create({
      organizationName: "Bulk First",
      legalName: "Bulk First SA",
      acronym: "BLF",
      organizationLogo: "https://example.com/bf.png",
      organizationWebsite: "https://bf.example.com",
      representativeName: "First Owner",
    });
    const second = await provider.create({
      organizationName: "Bulk Second",
      legalName: "Bulk Second SA",
      acronym: "BLS",
      organizationLogo: "https://example.com/bs.png",
      organizationWebsite: "https://bs.example.com",
      representativeName: "Second Owner",
    });

    const byIds = await provider.bulkUpdateStatus({
      organizationIds: [first.organizationId],
      organizationStatus: OrganizationStatus.INACTIVE,
    });

    const applyAll = await provider.bulkUpdateStatus({
      applyToAll: true,
      organizationStatus: OrganizationStatus.SUSPENDED,
      includeDeleted: true,
    });

    const deleteByIds = await provider.bulkSoftDelete({
      organizationIds: [first.organizationId, second.organizationId],
      includeDeleted: false,
    });

    expect(byIds.matchedCount).toBe(1);
    expect(byIds.modifiedCount).toBe(1);
    expect(applyAll.matchedCount).toBeGreaterThanOrEqual(1);
    expect(deleteByIds.matchedCount).toBe(2);
  });
});
