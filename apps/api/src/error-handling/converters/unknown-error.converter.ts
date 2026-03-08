/**
 * Converter for Zod validation errors
 */
import { ZodError } from "zod";
import { BadRequestError } from "../errors";

interface ValidationDetail {
  field: string;
  message: string;
}

export function convertZodError(error: ZodError): BadRequestError {
  const validationDetails: ValidationDetail[] = error.issues.map((issue) => ({
    field: String(issue.path.join(".")),
    message: issue.message,
  }));

  return new BadRequestError("Validation failed", {
    validationErrors: validationDetails,
  });
}
