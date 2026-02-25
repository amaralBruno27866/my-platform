import { getRedisConnectionState } from "../client";

export function getRedisHealth() {
  return {
    state: getRedisConnectionState(),
  } as const;
}
