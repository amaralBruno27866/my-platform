import { describe, expect, it } from "vitest";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "./http-errors";

describe("HTTP Errors", () => {
  describe("BadRequestError", () => {
    it("creates error with correct status and code", () => {
      const error = new BadRequestError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.isOperational).toBe(true);
    });

    it("includes details when provided", () => {
      const details = { field: "email", reason: "invalid format" };
      const error = new BadRequestError("Validation failed", details);

      expect(error.details).toEqual(details);
    });
  });

  describe("UnauthorizedError", () => {
    it("creates error with correct status and code", () => {
      const error = new UnauthorizedError("Not authenticated");

      expect(error.message).toBe("Not authenticated");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.isOperational).toBe(true);
    });
  });

  describe("ForbiddenError", () => {
    it("creates error with correct status and code", () => {
      const error = new ForbiddenError("Access denied");

      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
      expect(error.isOperational).toBe(true);
    });
  });

  describe("NotFoundError", () => {
    it("creates error with correct status and code", () => {
      const error = new NotFoundError("Resource not found");

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.isOperational).toBe(true);
    });
  });

  describe("ConflictError", () => {
    it("creates error with correct status and code", () => {
      const error = new ConflictError("Duplicate entry");

      expect(error.message).toBe("Duplicate entry");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
      expect(error.isOperational).toBe(true);
    });
  });

  describe("InternalServerError", () => {
    it("creates error with correct status and code", () => {
      const error = new InternalServerError("Server crashed");

      expect(error.message).toBe("Server crashed");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.isOperational).toBe(false); // Not operational
    });

    it("marks error as non-operational", () => {
      const error = new InternalServerError("Unexpected error");

      expect(error.isOperational).toBe(false);
    });
  });
});
