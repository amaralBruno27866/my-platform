import { describe, expect, it } from "vitest";
import { convertMongoError } from "./mongo-error.converter";
import { BadRequestError, ConflictError } from "../errors";

describe("MongoError Converter", () => {
  describe("convertMongoError", () => {
    it("converts duplicate key error (code 11000) to ConflictError", () => {
      const mongoError = {
        code: 11000,
        message: "E11000 duplicate key error",
        keyValue: { email: "test@mail.com" },
      };

      const result = convertMongoError(mongoError);

      expect(result).toBeInstanceOf(ConflictError);
      expect(result.message).toBe("Duplicate value for field: email");
      expect(result.statusCode).toBe(409);
      expect(result.code).toBe("CONFLICT");
      expect(result.details).toEqual({ email: "test@mail.com" });
    });

    it("handles duplicate error without keyValue", () => {
      const mongoError = {
        code: 11000,
        message: "E11000 duplicate key error",
      };

      const result = convertMongoError(mongoError);

      expect(result).toBeInstanceOf(ConflictError);
      expect(result.message).toBe("Duplicate value for field: field");
    });

    it("converts CastError to BadRequestError", () => {
      const mongoError = {
        name: "CastError",
        message: "Cast to ObjectId failed for value xyz",
      };

      const result = convertMongoError(mongoError);

      expect(result).toBeInstanceOf(BadRequestError);
      expect(result.message).toBe("Invalid identifier format");
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe("BAD_REQUEST");
      expect(result.details).toEqual({
        message: "Cast to ObjectId failed for value xyz",
      });
    });

    it("converts ValidationError to BadRequestError", () => {
      const mongoError = {
        name: "ValidationError",
        message: "Validation failed: name required",
      };

      const result = convertMongoError(mongoError);

      expect(result).toBeInstanceOf(BadRequestError);
      expect(result.message).toBe("Validation failed");
      expect(result.details).toEqual({
        message: "Validation failed: name required",
      });
    });

    it("converts generic mongo error to BadRequestError", () => {
      const mongoError = {
        name: "MongoServerError",
        message: "Some database error",
      };

      const result = convertMongoError(mongoError);

      expect(result).toBeInstanceOf(BadRequestError);
      expect(result.message).toBe("Database error");
      expect(result.details).toEqual({ message: "Some database error" });
    });
  });
});
