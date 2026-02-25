import { getRedisClient } from "../client";

export class RedisCacheService {
  async getString(key: string): Promise<string | null> {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    try {
      return await client.get(key);
    } catch {
      return null;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.getString(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setString(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    const client = await getRedisClient();
    if (!client) {
      return;
    }

    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, value, "EX", ttlSeconds);
        return;
      }

      await client.set(key, value);
    } catch {
      // noop
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.setString(key, JSON.stringify(value), ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) {
      return;
    }

    try {
      await client.del(key);
    } catch {
      // noop
    }
  }

  async increment(key: string): Promise<number | null> {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    try {
      return await client.incr(key);
    } catch {
      return null;
    }
  }

  async getNumber(key: string): Promise<number | null> {
    const raw = await this.getString(key);
    if (!raw) {
      return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }
}

export const redisCacheService = new RedisCacheService();
