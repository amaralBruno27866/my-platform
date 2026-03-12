import { LoginInput } from "../models/login-form.types";
import { LoginSessionView, LoginSuccessResult } from "../models/login.types";
import { LoginMockProvider } from "../mock/login.mock-provider";
import { ILoginProvider } from "./login-provider.interface";

export class LoginService {
  constructor(
    private readonly provider: ILoginProvider = new LoginMockProvider(),
  ) {}

  login(input: LoginInput): Promise<LoginSuccessResult> {
    return this.provider.login(input);
  }

  logout(): Promise<void> {
    return this.provider.logout();
  }

  getCurrentSession(): Promise<LoginSessionView | null> {
    return this.provider.getCurrentSession();
  }
}

export const loginService = new LoginService();
