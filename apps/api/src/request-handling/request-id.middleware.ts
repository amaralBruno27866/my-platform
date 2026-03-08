/**
 * Request ID middleware
 * Generates or extracts request ID for tracing
 */
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Use X-Request-ID from client or generate new UUID
  req.id = (req.header("x-request-id") as string) || randomUUID();

  // Return in response headers for client correlation
  res.setHeader("X-Request-ID", req.id);
  res.setHeader("X-Trace-ID", req.id);

  next();
}
