import { describe, expect, it } from "vitest";
import { z, ZodError } from "zod";
import { convertZodError } from "./unknown-error.converter";
import { BadRequestError } from "../errors";

describe("Zod Error Converter", () => {
  describe("convertZodError", () => {
    it("converts ZodError with single validation issue", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      try {
        schema.parse({ email: "invalid-email" });
      } catch (error) {
        const result = convertZodError(error as ZodError);

        expect(result).toBeInstanceOf(BadRequestError);
        expect(result.statusCode).toBe(400);
        expect(result.code).toBe("BAD_REQUEST");
        expect(result.message).toBe("Validation failed");
        expect(result.details).toHaveProperty("validationErrors");

        const details = result.details as {
          validationErrors: Array<{ field: string; message: string }>;
        };
        expect(details.validationErrors).toHaveLength(1);
        expect(details.validationErrors[0].field).toBe("email");
        expect(details.validationErrors[0].message).toContain("email");
      }
    });

    it("converts ZodError with multiple validation issues", () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
        name: z.string().min(3),
      });

      try {
        schema.parse({ email: "invalid", age: 15, name: "ab" });
      } catch (error) {
        const result = convertZodError(error as ZodError);

        const details = result.details as {
          validationErrors: Array<{ field: string; message: string }>;
        };
        expect(details.validationErrors.length).toBeGreaterThan(0);

        const fields = details.validationErrors.map((v) => v.field);
        expect(fields).toContain("email");
        expect(fields).toContain("age");
        expect(fields).toContain("name");
      }
    });

    it("converts ZodError with nested paths", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      try {
        schema.parse({ user: { profile: { name: "" } } });
      } catch (error) {
        const result = convertZodError(error as ZodError);

        const details = result.details as {
          validationErrors: Array<{ field: string; message: string }>;
        };
        expect(details.validationErrors[0].field).toBe("user.profile.name");
      }
    });

    it("converts ZodError with array path", () => {
      const schema = z.object({
        items: z.array(z.string().min(1)),
      });

      try {
        schema.parse({ items: ["valid", ""] });
      } catch (error) {
        const result = convertZodError(error as ZodError);

        const details = result.details as {
          validationErrors: Array<{ field: string; message: string }>;
        };
        expect(details.validationErrors[0].field).toContain("items");
      }
    });

    it("handles missing required fields", () => {
      const schema = z.object({
        requiredField: z.string(),
      });

      try {
        schema.parse({});
      } catch (error) {
        const result = convertZodError(error as ZodError);

        const details = result.details as {
          validationErrors: Array<{ field: string; message: string }>;
        };
        expect(details.validationErrors[0].field).toBe("requiredField");
        expect(details.validationErrors[0].message).toContain(
          "expected string",
        );
      }
    });
  });
});
