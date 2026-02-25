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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mongoUri,
  authJwtSecret,
  authJwtExpiresIn,
} as const;
