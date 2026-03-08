/**
 * Async handler wrapper
 * Automatically catches promise rejections and passes to error handler
 */
import { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

/**
 * Wraps async route handlers to catch errors automatically
 * @example
 * router.post('/signup', asyncHandler(async (req, res) => {
 *   const user = await userService.create(req.body);
 *   res.status(201).json(user);
 *   // Errors automatically go to global error handler
 * }));
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
