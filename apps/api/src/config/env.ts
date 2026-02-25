import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const dotenvCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../../.env"),
];

const dotenvPath = dotenvCandidates.find((candidatePath) =>
  existsSync(candidatePath),
);

if (dotenvPath) {
  config({ path: dotenvPath });
}

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is required");
}

const authJwtSecret = process.env.AUTH_JWT_SECRET ?? "dev-only-change-me";
const authJwtExpiresIn = process.env.AUTH_JWT_EXPIRES_IN ?? "15m";
const redisEnabled =
  process.env.REDIS_ENABLED !== undefined
    ? process.env.REDIS_ENABLED === "true"
    : (process.env.NODE_ENV ?? "development") !== "test";
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const redisOrganizationCacheTtlSeconds = Number(
  process.env.REDIS_ORGANIZATION_CACHE_TTL_SECONDS ?? 60,
);
const redisAuthSessionTtlSeconds = Number(
  process.env.REDIS_AUTH_SESSION_TTL_SECONDS ?? 900,
);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mongoUri,
  authJwtSecret,
  authJwtExpiresIn,
  redisEnabled,
  redisUrl,
  redisOrganizationCacheTtlSeconds,
  redisAuthSessionTtlSeconds,
} as const;
