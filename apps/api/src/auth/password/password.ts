import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_HASH_PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [prefix, salt, storedHash] = encoded.split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, 64).toString("hex");

  return timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
}
