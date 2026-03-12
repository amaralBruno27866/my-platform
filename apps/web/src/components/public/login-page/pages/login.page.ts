import { LoginInput } from "../models/login-form.types";
import { loginState } from "../state/login.state";

export async function loadLoginPage() {
  await loginState.restoreSession();
  return loginState.value;
}

export async function submitLoginPage(input: LoginInput) {
  return loginState.login(input);
}

export async function submitLogoutPage() {
  return loginState.logout();
}
