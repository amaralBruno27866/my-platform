import { z } from "zod";
import { describe, expect, it } from "vitest";
import {
  OrganizationBadRequestError,
  OrganizationConflictError,
  OrganizationErrorCode,
  OrganizationForbiddenError,
  OrganizationInternalError,
  toOrganizationAppError,
} from "../errors";

describe("organization error handling", () => {
  it("returns same instance for OrganizationAppError", () => {
    const error = new OrganizationForbiddenError("forbidden");
    const mapped = toOrganizationAppError(error);

    expect(mapped).toBe(error);
    expect(mapped.code).toBe(OrganizationErrorCode.FORBIDDEN);
  });

  it("maps zod errors to bad request", () => {
    const schema = z.object({ name: z.string().min(3) });
    const result = schema.safeParse({ name: "ab" });

    if (result.success) {
      throw new Error("expected schema to fail");
    }

    const mapped = toOrganizationAppError(result.error);

    expect(mapped).toBeInstanceOf(OrganizationBadRequestError);
    expect(mapped.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("maps duplicate key errors to conflict", () => {
    const mapped = toOrganizationAppError({
      code: 11000,
      message: "E11000 duplicate key error",
    });

    expect(mapped).toBeInstanceOf(OrganizationConflictError);
    expect(mapped.code).toBe(OrganizationErrorCode.CONFLICT);
  });

  it("maps cast errors to bad request", () => {
    const mapped = toOrganizationAppError({
      name: "CastError",
      message: "Cast to ObjectId failed",
    });

    expect(mapped).toBeInstanceOf(OrganizationBadRequestError);
    expect(mapped.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("maps unknown errors to internal", () => {
    const mapped = toOrganizationAppError(new Error("boom"));

    expect(mapped).toBeInstanceOf(OrganizationInternalError);
    expect(mapped.code).toBe(OrganizationErrorCode.INTERNAL);
  });
});
