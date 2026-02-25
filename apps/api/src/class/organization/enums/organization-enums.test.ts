import { describe, expect, it } from "vitest";
import { getOrganizationStatusName, OrganizationSttus } from "./status.enum";

describe("organization status enum helper", () => {
  it("returns display name for known and unknown statuses", () => {
    expect(getOrganizationStatusName(OrganizationSttus.ACTIVE)).toBe("Active");
    expect(getOrganizationStatusName(OrganizationSttus.INACTIVE)).toBe(
      "Inactive",
    );
    expect(getOrganizationStatusName(OrganizationSttus.SUSPENDED)).toBe(
      "Suspended",
    );
    expect(getOrganizationStatusName(OrganizationSttus.DELETED)).toBe(
      "Deleted",
    );
    expect(getOrganizationStatusName(999 as OrganizationSttus)).toBe("Unknown");
  });
});
