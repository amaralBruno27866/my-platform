import { LoginInput } from "../models/login-form.types";
import { LoginSessionView, LoginSuccessResult } from "../models/login.types";
import { ILoginProvider } from "../services/login-provider.interface";
import { loginMockAccount, loginMockCredentials } from "./login.mock-data";

export class LoginMockProvider implements ILoginProvider {
  private currentSession: LoginSessionView | null = null;

  async login(input: LoginInput): Promise<LoginSuccessResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    const validEmail = loginMockCredentials.email;
    const validPassword = loginMockCredentials.password;

    if (email !== validEmail || password !== validPassword) {
      throw new Error("Invalid credentials");
    }

    const expiresIn = 60 * 15;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const accessToken = "mock-access-token";

    this.currentSession = {
      isAuthenticated: true,
      accessToken,
      expiresAt,
      account: {
        ...loginMockAccount,
        email,
      },
    };

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
      account: {
        ...loginMockAccount,
        email,
      },
    };
  }

  async logout(): Promise<void> {
    this.currentSession = null;
  }

  async getCurrentSession(): Promise<LoginSessionView | null> {
    return this.currentSession;
  }
}
