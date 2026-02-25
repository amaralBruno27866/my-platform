import type { AuthTokenPayload } from "../token";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export {};
