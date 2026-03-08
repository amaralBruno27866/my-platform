import { NextFunction, Request, Response } from "express";
import { authUnauthorizedError } from "../errors";
import { authStore } from "../store";
import { verifyAccessToken } from "../token";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  (async () => {
    const authorization = req.header("authorization") ?? "";

    if (!authorization.startsWith("Bearer ")) {
      throw authUnauthorizedError("Missing Bearer token");
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      throw authUnauthorizedError("Missing token");
    }

    const payload = verifyAccessToken(token);
    const active = await authStore.ensureTokenIsActive(token, payload.sub);

    if (!active) {
      throw authUnauthorizedError("Inactive session");
    }

    req.auth = payload;
    next();
  })().catch(next); // ✅ NEW: Pass error to global handler via next()
}
