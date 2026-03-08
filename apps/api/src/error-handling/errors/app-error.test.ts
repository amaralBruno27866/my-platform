import { describe, expect, it } from "vitest";
import { isAppError, getErrorMessage } from "./app-error";
import { BadRequestError } from "./http-errors";

describe("AppError Utilities", () => {
  describe("isAppError", () => {
    it("returns true for AppError instances", () => {
      const error = new BadRequestError("Test error");
      expect(isAppError(error)).toBe(true);
    });

    it("returns false for generic Error", () => {
      const error = new Error("Generic error");
      expect(isAppError(error)).toBe(false);
    });

    it("returns false for non-error values", () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError("string error")).toBe(false);
      expect(isAppError({})).toBe(false);
      expect(isAppError(123)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("extracts message from Error instances", () => {
      const error = new Error("Error message");
      expect(getErrorMessage(error)).toBe("Error message");
    });

    it("extracts message from AppError instances", () => {
      const error = new BadRequestError("App error message");
      expect(getErrorMessage(error)).toBe("App error message");
    });

    it("converts string to string", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("converts number to string", () => {
      expect(getErrorMessage(123)).toBe("123");
    });

    it("converts object to string", () => {
      expect(getErrorMessage({ code: 500 })).toBe("[object Object]");
    });

    it("converts null/undefined to string", () => {
      expect(getErrorMessage(null)).toBe("null");
      expect(getErrorMessage(undefined)).toBe("undefined");
    });
  });

  describe("AppError.toJSON", () => {
    it("serializes AppError with all properties", () => {
      const details = { field: "email", reason: "invalid" };
      const error = new BadRequestError("Validation failed", details);

      const json = error.toJSON();

      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("message", "Validation failed");
      expect(json).toHaveProperty("statusCode", 400);
      expect(json).toHaveProperty("code", "BAD_REQUEST");
      expect(json).toHaveProperty("details", details);
      expect(json).toHaveProperty("timestamp");
      expect(json.timestamp).toBeInstanceOf(Date);
    });

    it("includes error details when present", () => {
      const details = { userId: "123", action: "delete" };
      const error = new BadRequestError("Test", details);

      const json = error.toJSON();
      expect(json.details).toEqual(details);
    });

    it("handles errors without details", () => {
      const error = new BadRequestError("No details");

      const json = error.toJSON();
      expect(json.details).toBeUndefined();
    });
  });
});
