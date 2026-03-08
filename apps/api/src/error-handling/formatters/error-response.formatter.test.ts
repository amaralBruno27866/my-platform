import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { formatErrorResponse } from "./error-response.formatter";
import { BadRequestError, InternalServerError } from "../errors";
import { env } from "../../config/env";

describe("Error Response Formatter", () => {
  const originalNodeEnv = env.nodeEnv;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatErrorResponse", () => {
    it("formats error with all fields in development", () => {
      (env as { nodeEnv: string }).nodeEnv = "development";

      const error = new BadRequestError("Invalid input", { field: "email" });
      const result = formatErrorResponse(error, "trace-123", "/api/users");

      expect(result).toMatchObject({
        message: "Invalid input",
        code: "BAD_REQUEST",
        statusCode: 400,
        traceId: "trace-123",
        details: { field: "email" },
        path: "/api/users",
      });
      expect(result.timestamp).toBeDefined();
      expect(result.stack).toBeDefined();
    });

    it("formats error with all fields in test environment", () => {
      (env as { nodeEnv: string }).nodeEnv = "test";

      const error = new BadRequestError("Test error");
      const result = formatErrorResponse(error, "trace-456");

      expect(result).toMatchObject({
        message: "Test error",
        code: "BAD_REQUEST",
        statusCode: 400,
        traceId: "trace-456",
      });
      expect(result.stack).toBeDefined();
    });

    it("sanitizes stack trace in production", () => {
      (env as { nodeEnv: string }).nodeEnv = "production";

      const error = new BadRequestError("Production error");
      const result = formatErrorResponse(error, "trace-789");

      expect(result).toMatchObject({
        message: "Production error",
        code: "BAD_REQUEST",
        statusCode: 400,
        traceId: "trace-789",
      });
      expect(result.stack).toBeUndefined();
    });

    it("includes details for operational errors in production", () => {
      (env as { nodeEnv: string }).nodeEnv = "production";

      const error = new BadRequestError("Validation error", {
        validationErrors: [{ field: "email", message: "invalid" }],
      });
      const result = formatErrorResponse(error, "trace-999");

      expect(result.details).toEqual({
        validationErrors: [{ field: "email", message: "invalid" }],
      });
    });

    it("hides details for non-operational errors in production", () => {
      (env as { nodeEnv: string }).nodeEnv = "production";

      const error = new InternalServerError("Server crashed", {
        sensitiveData: "leaked",
      });
      const result = formatErrorResponse(error, "trace-111");

      expect(result.details).toBeUndefined();
      expect(result.stack).toBeUndefined();
    });

    it("omits path when not provided", () => {
      (env as { nodeEnv: string }).nodeEnv = "development";

      const error = new BadRequestError("Error");
      const result = formatErrorResponse(error, "trace-222");

      expect(result.path).toBeUndefined();
    });
  });

  // Restore original env after tests
  afterAll(() => {
    (env as { nodeEnv: string }).nodeEnv = originalNodeEnv;
  });
});
