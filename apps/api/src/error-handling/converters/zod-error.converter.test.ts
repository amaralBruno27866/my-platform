import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertZodError } from "./unknown-error.converter";
import { BadRequestError } from "../errors";

describe("ZodError Converter", () => {
  describe("convertZodError", () => {
    it("converts ZodError to BadRequestError with validation details", () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      let zodError;
      try {
        schema.parse({ email: "invalid", age: 15 });
      } catch (error) {
        zodError = error;
      }

      const result = convertZodError(zodError as z.ZodError);

      expect(result).toBeInstanceOf(BadRequestError);
      expect(result.message).toBe("Validation failed");
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe("BAD_REQUEST");
      expect(result.details).toHaveProperty("validationErrors");

      const details = result.details as { validationErrors: unknown[] };
      expect(details.validationErrors).toHaveLength(2);
    });

    it("formats nested field paths correctly", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      let zodError;
      try {
        schema.parse({ user: { profile: { name: "" } } });
      } catch (error) {
        zodError = error;
      }

      const result = convertZodError(zodError as z.ZodError);
      const details = result.details as {
        validationErrors: Array<{ field: string; message: string }>;
      };

      expect(details.validationErrors[0].field).toBe("user.profile.name");
      expect(details.validationErrors[0].message).toBeTruthy();
    });

    it("handles array validation errors", () => {
      const schema = z.object({
        items: z.array(z.string().min(1)),
      });

      let zodError;
      try {
        schema.parse({ items: ["valid", "", "also-valid"] });
      } catch (error) {
        zodError = error;
      }

      const result = convertZodError(zodError as z.ZodError);
      const details = result.details as {
        validationErrors: Array<{ field: string; message: string }>;
      };

      expect(details.validationErrors[0].field).toBe("items.1");
    });
  });
});
