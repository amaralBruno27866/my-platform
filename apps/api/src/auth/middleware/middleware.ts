import { NextFunction, Request, Response } from "express";
import { authUnauthorizedError, toAuthAppError } from "../errors";
import { verifyAccessToken } from "../token";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authorization = req.header("authorization") ?? "";

    if (!authorization.startsWith("Bearer ")) {
      throw authUnauthorizedError("Missing Bearer token");
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      throw authUnauthorizedError("Missing token");
    }

    req.auth = verifyAccessToken(token);
    next();
  } catch (error) {
    const appError = toAuthAppError(error);
    res.status(appError.statusCode).json({
      message: appError.message,
      code: appError.code,
      details: appError.details,
    });
  }
}
