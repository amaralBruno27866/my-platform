import { afterEach, describe, expect, it, vi } from "vitest";
import { loadOrganizationListPage } from "../pages/organization-list.page";
import { loadOrganizationDetailPage } from "../pages/organization-detail.page";
import {
  submitOrganizationCreatePage,
  submitOrganizationEditPage,
} from "../pages/organization-form.page";
import { organizationState } from "../state/organization.state";
import { createOrganizationTableModel } from "../components/organization-table.component";
import { createOrganizationFormModel } from "../components/organization-form.component";
import { createOrganizationDetailModalModel } from "../components/organization-detail-modal.component";
import { createOrganizationBulkActionsModel } from "../components/organization-bulk-actions.component";
import { OrganizationStatus } from "../models/organization.types";

describe("organization pages and component models", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls state methods from pages", async () => {
    const loadSpy = vi.spyOn(organizationState, "load").mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    const selectSpy = vi
      .spyOn(organizationState, "selectById")
      .mockResolvedValue(undefined as never);
    const createSpy = vi
      .spyOn(organizationState, "create")
      .mockResolvedValue(undefined as never);
    const updateSpy = vi
      .spyOn(organizationState, "update")
      .mockResolvedValue(undefined as never);

    await loadOrganizationListPage({ page: 1, limit: 10, search: "abc" });
    await loadOrganizationDetailPage("org-1");
    await submitOrganizationCreatePage({
      organizationName: "X",
      legalName: "X Inc",
      acronym: "X",
      organizationLogo: "https://example.com/x.png",
      organizationWebsite: "https://example.com",
      representativeName: "User",
    });
    await submitOrganizationEditPage("org-1", {
      organizationStatus: OrganizationStatus.SUSPENDED,
    });

    expect(loadSpy).toHaveBeenCalledWith({ page: 1, limit: 10, search: "abc" });
    expect(selectSpy).toHaveBeenCalledWith("org-1");
    expect(createSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith("org-1", {
      organizationStatus: OrganizationStatus.SUSPENDED,
    });
  });

  it("returns props from component model factories", () => {
    const tableProps = {
      rows: [],
      loading: false,
      onView: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    };
    const formProps = {
      mode: "create" as const,
      initialValues: {},
      onSubmit: vi.fn().mockResolvedValue(undefined),
      submitting: false,
    };
    const detailProps = {
      open: true,
      organization: undefined,
      loading: false,
      error: undefined,
      onClose: vi.fn(),
      onEdit: vi.fn(),
    };
    const bulkProps = {
      selectedIds: ["org-1"],
      onBulkUpdateStatus: vi.fn().mockResolvedValue(undefined),
      onBulkSoftDelete: vi.fn().mockResolvedValue(undefined),
      disabled: false,
    };

    expect(createOrganizationTableModel(tableProps)).toBe(tableProps);
    expect(createOrganizationFormModel(formProps)).toBe(formProps);
    expect(createOrganizationDetailModalModel(detailProps)).toBe(detailProps);
    expect(createOrganizationBulkActionsModel(bulkProps)).toBe(bulkProps);
  });
});
