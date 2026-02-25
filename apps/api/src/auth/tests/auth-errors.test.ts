import { describe, expect, it } from "vitest";
import {
  AuthAppError,
  authAccountInactiveError,
  authAccountNotFoundError,
  authEmailConflictError,
  authForbiddenError,
  authInvalidCredentialsError,
  authUnauthorizedError,
  authValidationError,
  isAuthAppError,
  toAuthAppError,
} from "../errors";
import { AuthErrorCode } from "../contracts";

describe("auth errors", () => {
  it("creates and identifies AuthAppError", () => {
    const error = new AuthAppError(400, AuthErrorCode.VALIDATION_ERROR, "bad");

    expect(isAuthAppError(error)).toBe(true);
    expect(error.code).toBe(AuthErrorCode.VALIDATION_ERROR);
  });

  it("maps unknown and native errors", () => {
    const fromNative = toAuthAppError(new Error("native"));
    const fromUnknown = toAuthAppError({ x: 1 });

    expect(fromNative.message).toBe("native");
    expect(fromUnknown.message).toBe("Unexpected auth error");
  });

  it("builds specialized errors", () => {
    expect(authValidationError("v").statusCode).toBe(400);
    expect(authInvalidCredentialsError().statusCode).toBe(401);
    expect(authEmailConflictError("a@b.com").statusCode).toBe(409);
    expect(authUnauthorizedError().code).toBe(AuthErrorCode.UNAUTHORIZED);
    expect(authForbiddenError().code).toBe(AuthErrorCode.FORBIDDEN);
    expect(authAccountNotFoundError().statusCode).toBe(404);
    expect(authAccountInactiveError().statusCode).toBe(403);
  });
});
