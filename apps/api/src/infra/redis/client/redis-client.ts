import Redis from "ioredis";
import { env } from "../../../config/env";

type RedisHealthState =
  | "disabled"
  | "ready"
  | "connecting"
  | "reconnecting"
  | "ended"
  | "error"
  | "unknown";

let client: Redis | null = null;

function normalizeRedisStatus(status: string | undefined): RedisHealthState {
  switch (status) {
    case "ready":
      return "ready";
    case "connect":
    case "connecting":
      return "connecting";
    case "reconnecting":
      return "reconnecting";
    case "end":
      return "ended";
    case "wait":
      return "connecting";
    default:
      return status ? "unknown" : "unknown";
  }
}

function createClient(): Redis {
  const redis = new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 1000,
  });

  redis.on("error", () => {
    // noop: handled by safe wrapper methods
  });

  return redis;
}

export async function getRedisClient(): Promise<Redis | null> {
  if (!env.redisEnabled) {
    return null;
  }

  if (!client) {
    client = createClient();
  }

  if (client.status === "ready") {
    return client;
  }

  try {
    await client.connect();
    return client;
  } catch {
    return null;
  }
}

export function getRedisConnectionState(): RedisHealthState {
  if (!env.redisEnabled) {
    return "disabled";
  }

  return normalizeRedisStatus(client?.status);
}
