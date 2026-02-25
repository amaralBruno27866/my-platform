import { describe, expect, it } from "vitest";
import { OrganizationStatus } from "../models";
import { OrganizationMockProvider } from "../mock";

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
});
