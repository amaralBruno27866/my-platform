/**
 * Common HTTP error classes
 * Used when domain-specific errors don't apply
 */
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = "BAD_REQUEST";
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";
  readonly isOperational = false;
}
