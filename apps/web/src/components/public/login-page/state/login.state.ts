import { LoginInput } from "../models/login-form.types";
import { LoginSessionView } from "../models/login.types";
import { LoginService, loginService } from "../services/login.service";

export interface LoginStateSnapshot {
  session: LoginSessionView | null;
  loading: boolean;
  error?: string;
}

export class LoginState {
  private snapshot: LoginStateSnapshot = {
    session: null,
    loading: false,
    error: undefined,
  };

  constructor(private readonly service: LoginService = loginService) {}

  get value(): LoginStateSnapshot {
    return this.snapshot;
  }

  async restoreSession(): Promise<LoginSessionView | null> {
    this.snapshot = { ...this.snapshot, loading: true, error: undefined };

    try {
      const session = await this.service.getCurrentSession();
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        session,
      };
      return session;
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      };
      throw error;
    }
  }

  async login(input: LoginInput): Promise<LoginSessionView> {
    this.snapshot = { ...this.snapshot, loading: true, error: undefined };

    try {
      const result = await this.service.login(input);
      const session: LoginSessionView = {
        isAuthenticated: true,
        accessToken: result.accessToken,
        account: result.account,
        expiresAt: new Date(Date.now() + result.expiresIn * 1000).toISOString(),
      };

      this.snapshot = {
        ...this.snapshot,
        loading: false,
        session,
      };

      return session;
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      };
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.snapshot = { ...this.snapshot, loading: true, error: undefined };

    try {
      await this.service.logout();
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        session: null,
      };
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        loading: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      };
      throw error;
    }
  }
}

export const loginState = new LoginState();
