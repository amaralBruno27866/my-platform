import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { authUnauthorizedError } from "../errors";

export interface AuthTokenPayload {
  sub: string;
  accountPublicId: string;
  email: string;
  privilege: number;
  accessModifier: number;
  accountStatus: number;
  organizationId: string;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.authJwtSecret, {
    algorithm: "HS256",
    expiresIn: env.authJwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.authJwtSecret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded !== "object" || !decoded) {
      throw authUnauthorizedError("Invalid token payload");
    }

    return decoded as AuthTokenPayload;
  } catch {
    throw authUnauthorizedError("Invalid or expired token");
  }
}
