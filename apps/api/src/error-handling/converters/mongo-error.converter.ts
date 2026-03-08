/**
 * Converter for MongoDB/Mongoose errors
 */
import { BadRequestError, ConflictError, AppError } from "../errors";

interface MongooseError {
  code?: number;
  name?: string;
  message?: string;
  keyValue?: Record<string, unknown>;
}

export function convertMongoError(error: MongooseError): AppError {
  // Duplicate key error
  if (error.code === 11000) {
    const fieldName = Object.keys(error.keyValue || {})[0] || "field";
    return new ConflictError(
      `Duplicate value for field: ${fieldName}`,
      error.keyValue,
    );
  }

  // CastError (invalid ObjectId)
  if (error.name === "CastError") {
    return new BadRequestError("Invalid identifier format", {
      message: error.message,
    });
  }

  // ValidationError
  if (error.name === "ValidationError") {
    return new BadRequestError("Validation failed", { message: error.message });
  }

  // Generic mongo error
  return new BadRequestError("Database error", { message: error.message });
}
