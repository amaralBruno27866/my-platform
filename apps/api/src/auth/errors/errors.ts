import { AuthErrorCode } from "../contracts";

export class AuthAppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: AuthErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AuthAppError";
  }
}

export function isAuthAppError(error: unknown): error is AuthAppError {
  return error instanceof AuthAppError;
}

export function toAuthAppError(error: unknown): AuthAppError {
  if (isAuthAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AuthAppError(400, AuthErrorCode.VALIDATION_ERROR, error.message);
  }

  return new AuthAppError(
    400,
    AuthErrorCode.VALIDATION_ERROR,
    "Unexpected auth error",
    error,
  );
}

export function authValidationError(
  message: string,
  details?: unknown,
): AuthAppError {
  return new AuthAppError(
    400,
    AuthErrorCode.VALIDATION_ERROR,
    message,
    details,
  );
}

export function authInvalidCredentialsError(): AuthAppError {
  return new AuthAppError(
    401,
    AuthErrorCode.INVALID_CREDENTIALS,
    "Invalid credentials",
  );
}

export function authEmailConflictError(email: string): AuthAppError {
  return new AuthAppError(
    409,
    AuthErrorCode.EMAIL_ALREADY_IN_USE,
    "Email is already in use",
    { email },
  );
}

export function authUnauthorizedError(message = "Unauthorized"): AuthAppError {
  return new AuthAppError(401, AuthErrorCode.UNAUTHORIZED, message);
}

export function authForbiddenError(message = "Forbidden"): AuthAppError {
  return new AuthAppError(403, AuthErrorCode.FORBIDDEN, message);
}

export function authAccountNotFoundError(): AuthAppError {
  return new AuthAppError(
    404,
    AuthErrorCode.ACCOUNT_NOT_FOUND,
    "Account not found",
  );
}

export function authAccountInactiveError(): AuthAppError {
  return new AuthAppError(
    403,
    AuthErrorCode.ACCOUNT_INACTIVE,
    "Account is inactive",
  );
}
