import { Express } from "express";
import { authRouter } from "../controllers";

export function registerAuthModule(app: Express): void {
  app.use(authRouter);
}
