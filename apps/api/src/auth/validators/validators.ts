import { AuthLoginRequest, AuthSignupRequest } from "../contracts";
import { authValidationError } from "../errors";

const CANADA_PHONE_PATTERN = /^\(\d{3}\)\s\d{3}-\d{4}$/;

export function validateSignupInput(raw: unknown): AuthSignupRequest {
  if (!raw || typeof raw !== "object") {
    throw authValidationError("Invalid signup payload");
  }

  const input = raw as Partial<AuthSignupRequest>;

  if (!input.firstName?.trim()) {
    throw authValidationError("firstName is required");
  }

  if (!input.lastName?.trim()) {
    throw authValidationError("lastName is required");
  }

  if (!input.email?.trim()) {
    throw authValidationError("email is required");
  }

  if (!input.password || input.password.length < 8) {
    throw authValidationError("password must be at least 8 characters");
  }

  if (!input.organizationId?.trim()) {
    throw authValidationError("organizationId is required");
  }

  if (!Number.isInteger(input.accountGroup)) {
    throw authValidationError("accountGroup must be an integer");
  }

  const accountGroup = input.accountGroup as number;

  if (input.acceptanceTerm !== true) {
    throw authValidationError("acceptanceTerm must be true");
  }

  if (input.cellphone && !CANADA_PHONE_PATTERN.test(input.cellphone)) {
    throw authValidationError("cellphone must follow format (XXX) XXX-XXXX", {
      received: input.cellphone,
    });
  }

  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    cellphone: input.cellphone,
    password: input.password,
    acceptanceTerm: true,
    accountGroup,
    organizationId: input.organizationId.trim(),
  };
}

export function validateLoginInput(raw: unknown): AuthLoginRequest {
  if (!raw || typeof raw !== "object") {
    throw authValidationError("Invalid login payload");
  }

  const input = raw as Partial<AuthLoginRequest>;

  if (!input.email?.trim() || !input.password) {
    throw authValidationError("email and password are required");
  }

  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}
