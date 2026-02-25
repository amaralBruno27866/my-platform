import { describe, expect, it } from "vitest";
import * as admin from "../../index";
import * as organization from "../index";
import * as models from "../models";
import * as services from "../services";
import * as state from "../state";
import * as pages from "../pages";
import * as components from "../components";
import * as mappers from "../mappers";
import * as validators from "../validators";
import * as mock from "../mock";

describe("organization barrel exports", () => {
  it("exposes expected symbols from barrels", () => {
    expect(admin.organizationService).toBeDefined();
    expect(organization.organizationState).toBeDefined();
    expect(models.OrganizationStatus).toBeDefined();
    expect(services.OrganizationService).toBeDefined();
    expect(state.OrganizationState).toBeDefined();
    expect(pages.loadOrganizationListPage).toBeTypeOf("function");
    expect(components.createOrganizationTableModel).toBeTypeOf("function");
    expect(mappers.mapCreateInputToOrganizationView).toBeTypeOf("function");
    expect(validators.validateCreateOrganizationInput).toBeTypeOf("function");
    expect(mock.OrganizationMockProvider).toBeDefined();
  });
});
