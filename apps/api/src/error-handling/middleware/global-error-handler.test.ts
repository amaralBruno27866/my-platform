import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./global-error-handler";
import { BadRequestError, InternalServerError } from "../errors";
import { logger } from "../../logging";
import { Privilege } from "../../common/enums";

// Mock logger
vi.mock("../../logging", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Global Error Handler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      id: "test-request-id",
      path: "/api/test",
      method: "POST",
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn() as NextFunction;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("globalErrorHandler", () => {
    it("handles AppError correctly", () => {
      const error = new BadRequestError("Invalid input", { field: "email" });

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid input",
          code: "BAD_REQUEST",
          statusCode: 400,
          traceId: "test-request-id",
        }),
      );
    });

    it("wraps generic Error as InternalServerError", () => {
      const error = new Error("Unexpected error");

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          statusCode: 500,
        }),
      );
    });

    it("handles unknown error types", () => {
      const error = "String error";

      globalErrorHandler(
        error as unknown as Error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Unknown error occurred",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );
    });

    it("logs error with structured data", () => {
      const error = new BadRequestError("Test error");

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: "test-request-id",
          path: "/api/test",
          method: "POST",
          statusCode: 400,
          code: "BAD_REQUEST",
          message: "Test error",
        }),
      );
    });

    it("uses unknown traceId when req.id is missing", () => {
      mockReq.id = undefined;
      const error = new BadRequestError("Error");

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: "unknown",
        }),
      );
    });

    it("includes userId in logs when available", () => {
      (mockReq as any).auth = {
        sub: "user-123",
        accountPublicId: "acc-123",
        email: "test@example.com",
        privilege: Privilege.LOW,
        accessModifier: 1,
        organizationId: "org-123",
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      const error = new BadRequestError("Test");

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
        }),
      );
    });

    it("handles InternalServerError as non-operational", () => {
      const error = new InternalServerError("Critical failure");

      globalErrorHandler(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(error.isOperational).toBe(false);
    });
  });
});
