/**
 * Dev vs Prod error formatting
 * Sanitizes sensitive information in production
 */
import { AppError, ErrorResponse } from "../errors";
import { env } from "../../config/env";

export function formatErrorResponse(
  error: AppError,
  traceId: string,
  path?: string,
): ErrorResponse {
  const response: ErrorResponse = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    traceId,
    timestamp: new Date().toISOString(),
  };

  // Development: expose everything for debugging
  if (env.nodeEnv === "development" || env.nodeEnv === "test") {
    response.details = error.details;
    response.stack = error.stack;
    if (path) {
      response.path = path;
    }
    return response;
  }

  // Production: sanitize sensitive data
  if (error.isOperational) {
    // Operational errors can expose details (they're controlled)
    response.details = error.details;
  }
  // Stack trace never in production

  return response;
}
