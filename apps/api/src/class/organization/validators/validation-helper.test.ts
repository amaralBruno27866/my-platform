import { describe, expect, it, vi } from "vitest";
import {
  validateOrganizationCreate,
  validateOrganizationUpdate,
  validateOrganizationQuery,
  validateOrganizationBulkUpdateStatus,
  validateOrganizationBulkSoftDelete,
} from "./validation-helper";
import { OrganizationSttus } from "../enums";
import { Privilege } from "../../../common/enums";
import * as validators from "./validators-organization";

describe("validation-helper", () => {
  describe("validateOrganizationCreate", () => {
    it("returns parsed data for valid input", () => {
      const input = {
        organizationName: "Test Org",
        legalName: "Test Org Legal",
        acronym: "TO",
        organizationLogo: "https://example.com/logo.png",
        organizationWebsite: "https://example.com",
        representativeName: "John Doe",
        representativeAccountId: "507f191e810c19729de860ea",
        organizationEmail: "test@example.com",
      };

      const result = validateOrganizationCreate(input);

      expect(result).toBeDefined();
      expect(result.organizationName).toBe("Test Org");
    });

    it("throws OrganizationBadRequestError for invalid input", () => {
      expect(() => validateOrganizationCreate({})).toThrow("Validation failed");
    });

    it("handles non-Error exceptions in catch block", () => {
      const spy = vi
        .spyOn(validators.organizationCreateSchema, "parse")
        .mockImplementation(() => {
          throw "string error"; // Non-Error type
        });

      expect(() => validateOrganizationCreate({})).toThrow("Validation failed");

      spy.mockRestore();
    });
  });

  describe("validateOrganizationUpdate", () => {
    it("returns parsed data for valid input", () => {
      const input = {
        organizationName: "Updated Name",
      };

      const result = validateOrganizationUpdate(input);

      expect(result).toBeDefined();
      expect(result.organizationName).toBe("Updated Name");
    });

    it("throws OrganizationBadRequestError for invalid input", () => {
      expect(() => validateOrganizationUpdate({})).toThrow("Validation failed");
    });

    it("handles non-Error exceptions in catch block", () => {
      const spy = vi
        .spyOn(validators.organizationUpdateSchema, "parse")
        .mockImplementation(() => {
          throw { custom: "object error" }; // Non-Error type
        });

      expect(() => validateOrganizationUpdate({})).toThrow("Validation failed");

      spy.mockRestore();
    });
  });

  describe("validateOrganizationQuery", () => {
    it("returns parsed data for valid input", () => {
      const input = {
        page: "1",
        limit: "20",
        organizationStatus: OrganizationSttus.ACTIVE,
      };

      const result = validateOrganizationQuery(input);

      expect(result).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("throws OrganizationBadRequestError for invalid input", () => {
      expect(() => validateOrganizationQuery({ page: -1 })).toThrow(
        "Validation failed",
      );
    });

    it("handles non-Error exceptions in catch block", () => {
      const spy = vi
        .spyOn(validators.organizationQuerySchema, "parse")
        .mockImplementation(() => {
          throw 123; // Non-Error type
        });

      expect(() => validateOrganizationQuery({})).toThrow("Validation failed");

      spy.mockRestore();
    });
  });

  describe("validateOrganizationBulkUpdateStatus", () => {
    it("returns parsed data for valid input", () => {
      const input = {
        applyToAll: true,
        organizationStatus: OrganizationSttus.SUSPENDED,
      };

      const result = validateOrganizationBulkUpdateStatus(input);

      expect(result).toBeDefined();
      expect(result.applyToAll).toBe(true);
      expect(result.organizationStatus).toBe(OrganizationSttus.SUSPENDED);
    });

    it("throws OrganizationBadRequestError for invalid input", () => {
      expect(() =>
        validateOrganizationBulkUpdateStatus({ applyToAll: false }),
      ).toThrow("Validation failed");
    });

    it("handles non-Error exceptions in catch block", () => {
      const spy = vi
        .spyOn(validators.organizationBulkUpdateStatusSchema, "parse")
        .mockImplementation(() => {
          throw null; // Non-Error type
        });

      expect(() => validateOrganizationBulkUpdateStatus({})).toThrow(
        "Validation failed",
      );

      spy.mockRestore();
    });
  });

  describe("validateOrganizationBulkSoftDelete", () => {
    it("returns parsed data for valid input", () => {
      const input = {
        applyToAll: true,
      };

      const result = validateOrganizationBulkSoftDelete(input);

      expect(result).toBeDefined();
      expect(result.applyToAll).toBe(true);
    });

    it("throws OrganizationBadRequestError for invalid input", () => {
      expect(() =>
        validateOrganizationBulkSoftDelete({ applyToAll: false }),
      ).toThrow("Validation failed");
    });

    it("handles non-Error exceptions in catch block", () => {
      const spy = vi
        .spyOn(validators.organizationBulkSoftDeleteSchema, "parse")
        .mockImplementation(() => {
          throw undefined; // Non-Error type
        });

      expect(() => validateOrganizationBulkSoftDelete({})).toThrow(
        "Validation failed",
      );

      spy.mockRestore();
    });
  });
});
