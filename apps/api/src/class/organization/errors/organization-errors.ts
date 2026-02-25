import { ZodError } from "zod";
import { HttpStatus } from "./http-status";

export enum OrganizationErrorCode {
  BAD_REQUEST = "ORGANIZATION_BAD_REQUEST",
  UNAUTHORIZED = "ORGANIZATION_UNAUTHORIZED",
  FORBIDDEN = "ORGANIZATION_FORBIDDEN",
  NOT_FOUND = "ORGANIZATION_NOT_FOUND",
  CONFLICT = "ORGANIZATION_CONFLICT",
  INTERNAL = "ORGANIZATION_INTERNAL",
}

export class OrganizationAppError extends Error {
  readonly statusCode: HttpStatus;
  readonly code: OrganizationErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatus,
    code: OrganizationErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class OrganizationBadRequestError extends OrganizationAppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      OrganizationErrorCode.BAD_REQUEST,
      details,
    );
  }
}

export class OrganizationUnauthorizedError extends OrganizationAppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      OrganizationErrorCode.UNAUTHORIZED,
      details,
    );
  }
}

export class OrganizationForbiddenError extends OrganizationAppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.FORBIDDEN,
      OrganizationErrorCode.FORBIDDEN,
      details,
    );
  }
}

export class OrganizationNotFoundError extends OrganizationAppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.NOT_FOUND,
      OrganizationErrorCode.NOT_FOUND,
      details,
    );
  }
}

export class OrganizationConflictError extends OrganizationAppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.CONFLICT,
      OrganizationErrorCode.CONFLICT,
      details,
    );
  }
}

export class OrganizationInternalError extends OrganizationAppError {
  constructor(message = "Internal organization error", details?: unknown) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      OrganizationErrorCode.INTERNAL,
      details,
    );
  }
}

export function isOrganizationAppError(
  error: unknown,
): error is OrganizationAppError {
  return error instanceof OrganizationAppError;
}

export function toOrganizationAppError(error: unknown): OrganizationAppError {
  if (isOrganizationAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new OrganizationBadRequestError(
      "Validation failed",
      error.flatten(),
    );
  }

  const mongoError = error as {
    code?: number;
    name?: string;
    message?: string;
  };

  if (mongoError?.code === 11000) {
    return new OrganizationConflictError("Unique constraint violation", {
      message: mongoError.message,
    });
  }

  if (mongoError?.name === "CastError") {
    return new OrganizationBadRequestError("Invalid identifier format", {
      message: mongoError.message,
    });
  }

  if (error instanceof Error) {
    return new OrganizationInternalError("Internal organization error", {
      message: error.message,
    });
  }

  return new OrganizationInternalError();
}
