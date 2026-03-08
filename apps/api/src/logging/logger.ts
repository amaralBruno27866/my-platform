/**
 * Logger setup with Winston
 * Provides structured logging for production and development
 */
import winston, { Logger } from "winston";
import { env } from "../config/env";

const isDevelopment = env.nodeEnv === "development";
const isTest = env.nodeEnv === "test";

/**
 * Configure Winston logger
 */
function createLogger(): Logger {
  return winston.createLogger({
    level: isTest ? "error" : isDevelopment ? "debug" : "info",

    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      isDevelopment ? devFormat() : prodFormat(),
    ),

    defaultMeta: {
      service: "api",
      environment: env.nodeEnv,
    },

    transports: [
      new winston.transports.Console(),
      // File transport for errors
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      }),
      // File transport for all logs (production)
      ...(isDevelopment
        ? []
        : [
            new winston.transports.File({
              filename: "logs/combined.log",
              maxsize: 10485760,
              maxFiles: 10,
            }),
          ]),
    ],
  });
}

/**
 * Development format (readable)
 */
function devFormat() {
  return winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  });
}

/**
 * Production format (JSON for log aggregation)
 */
function prodFormat() {
  return winston.format.json();
}

export const logger = createLogger();
