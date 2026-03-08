import { Request, Response, Router } from "express";
import { AUTH_ROUTES } from "../contracts";
import { authStore } from "../store";
import { toAuthAppError } from "../errors";
import { validateLoginInput, validateSignupInput } from "../validators";
import { requireAuth } from "../middleware";

export const authRouter = Router();

function handleAuthError(error: unknown, res: Response): void {
  const appError = toAuthAppError(error);

  res.status(appError.statusCode).json({
    message: appError.message,
    code: appError.code,
    details: appError.details,
  });
}

authRouter.post(AUTH_ROUTES.signup, async (req: Request, res: Response) => {
  try {
    const payload = validateSignupInput(req.body);
    const created = await authStore.signup(payload);
    res.status(201).json(created);
  } catch (error) {
    handleAuthError(error, res);
  }
});

authRouter.post(AUTH_ROUTES.login, async (req: Request, res: Response) => {
  try {
    const payload = validateLoginInput(req.body);
    const logged = await authStore.login(payload);
    res.status(200).json(logged);
  } catch (error) {
    handleAuthError(error, res);
  }
});

authRouter.get(
  AUTH_ROUTES.me,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const accountId = req.auth?.sub;

      // Defensive check: requireAuth middleware guarantees req.auth.sub is set
      // istanbul ignore next - middleware always sets this, defensive code
      if (!accountId) {
        throw new Error("Missing auth context");
      }

      const me = await authStore.me(accountId);
      res.status(200).json(me);
    } catch (error) {
      handleAuthError(error, res);
    }
  },
);
