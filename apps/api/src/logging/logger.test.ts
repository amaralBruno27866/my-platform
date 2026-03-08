import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { logger } from "./logger";
import winston from "winston";

// Mock the environment
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Logger", () => {
  it("exports a winston logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger).toHaveProperty("info");
    expect(logger).toHaveProperty("error");
    expect(logger).toHaveProperty("warn");
    expect(logger).toHaveProperty("debug");
  });

  it("logger has correct methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  describe("logging methods", () => {
    it("can log info messages", () => {
      expect(() => logger.info("Test info message")).not.toThrow();
    });

    it("can log error messages", () => {
      expect(() => logger.error("Test error message")).not.toThrow();
    });

    it("can log warning messages", () => {
      expect(() => logger.warn("Test warning message")).not.toThrow();
    });

    it("can log debug messages", () => {
      expect(() => logger.debug("Test debug message")).not.toThrow();
    });

    it("can log with metadata", () => {
      expect(() =>
        logger.info("Test with metadata", {
          userId: "123",
          action: "login",
        }),
      ).not.toThrow();
    });

    it("can log errors with stack traces", () => {
      const error = new Error("Test error");
      expect(() =>
        logger.error("Error occurred", {
          error: error.message,
          stack: error.stack,
        }),
      ).not.toThrow();
    });
  });

  describe("logger configuration", () => {
    it("logger is instance of winston Logger", () => {
      expect(logger).toBeInstanceOf(winston.Logger);
    });

    it("logger has transports configured", () => {
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });
  });
});
