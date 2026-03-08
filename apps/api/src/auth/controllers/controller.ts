import { Request, Response, Router } from "express";
import { AUTH_ROUTES } from "../contracts";
import { authStore } from "../store";
import { validateLoginInput, validateSignupInput } from "../validators";
import { requireAuth } from "../middleware";
import { asyncHandler } from "../../request-handling";

export const authRouter = Router();

// ✅ NEW: Using asyncHandler - no try/catch needed, errors go to global handler
authRouter.post(
  AUTH_ROUTES.signup,
  asyncHandler(async (req: Request, res: Response) => {
    const payload = validateSignupInput(req.body);
    const created = await authStore.signup(payload);
    res.status(201).json(created);
  }),
);

authRouter.post(
  AUTH_ROUTES.login,
  asyncHandler(async (req: Request, res: Response) => {
    const payload = validateLoginInput(req.body);
    const logged = await authStore.login(payload);
    res.status(200).json(logged);
  }),
);

authRouter.get(
  AUTH_ROUTES.me,
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const accountId = req.auth?.sub;

    // Defensive check: requireAuth middleware guarantees req.auth.sub is set
    // istanbul ignore next - middleware always sets this, defensive code
    if (!accountId) {
      throw new Error("Missing auth context");
    }

    const me = await authStore.me(accountId);
    res.status(200).json(me);
  }),
);
