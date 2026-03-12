import { LoginInput } from "../models/login-form.types";
import { LoginSessionView, LoginSuccessResult } from "../models/login.types";

export interface ILoginProvider {
  login(input: LoginInput): Promise<LoginSuccessResult>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<LoginSessionView | null>;
}
