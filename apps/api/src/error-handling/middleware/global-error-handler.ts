/**
 * Global error handler middleware
 * Captures all unhandled errors and formats responses
 *
 * Note: Domain-specific errors (Auth, Organization, etc) should be converted
 * within their respective services/repositories where the context is known.
 * This handler only catches truly unexpected errors.
 */
import { Request, Response, NextFunction } from "express";
import { AppError, isAppError, InternalServerError } from "../errors";
import { formatErrorResponse } from "../formatters";
import { logger } from "../../logging";

export function globalErrorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = req.id || "unknown";

  // Convert unknown errors to AppError if needed
  let appError: AppError;

  if (isAppError(error)) {
    // Domain-specific or known error - use as-is
    appError = error;
  } else if (error instanceof Error) {
    // Wrap generic Error as internal server error
    appError = new InternalServerError(error.message, {
      originalError: error.message,
    });
  } else {
    // Unknown error type
    appError = new InternalServerError("Unknown error occurred", error);
  }

  // Format response (sanitizes based on NODE_ENV)
  const response = formatErrorResponse(appError, traceId, req.path);

  // Log error
  logger.error({
    traceId,
    path: req.path,
    method: req.method,
    statusCode: appError.statusCode,
    code: appError.code,
    message: appError.message,
    userId: (req as any).auth?.sub,
    errorName: appError.name,
    stack: appError.stack,
  });

  // Send response
  res.status(appError.statusCode).json(response);
}
