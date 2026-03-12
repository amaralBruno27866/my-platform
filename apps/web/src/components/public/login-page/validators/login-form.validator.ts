import { LoginInput } from "../models/login-form.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(input: LoginInput): string[] {
  const errors: string[] = [];

  if (!input.email?.trim()) {
    errors.push("email is required");
  } else if (!EMAIL_PATTERN.test(input.email.trim().toLowerCase())) {
    errors.push("email must be valid");
  }

  if (!input.password) {
    errors.push("password is required");
  }

  return errors;
}
