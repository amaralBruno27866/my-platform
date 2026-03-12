import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadLoginPage,
  submitLoginPage,
  submitLogoutPage,
} from "../pages/login.page";
import { loginState } from "../state/login.state";
import { createLoginFeedbackModel } from "../components/login-feedback.component";
import { createLoginFormModel } from "../components/login-form.component";

describe("login pages and component models", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls state methods from pages", async () => {
    const restoreSpy = vi
      .spyOn(loginState, "restoreSession")
      .mockResolvedValue(null);
    const loginSpy = vi.spyOn(loginState, "login").mockResolvedValue({
      isAuthenticated: true,
      accessToken: "token",
    });
    const logoutSpy = vi.spyOn(loginState, "logout").mockResolvedValue();

    await loadLoginPage();
    await submitLoginPage({
      email: "user@myplatform.local",
      password: "12345678",
    });
    await submitLogoutPage();

    expect(restoreSpy).toHaveBeenCalled();
    expect(loginSpy).toHaveBeenCalledWith({
      email: "user@myplatform.local",
      password: "12345678",
    });
    expect(logoutSpy).toHaveBeenCalled();
  });

  it("returns props from component model factories", () => {
    const formProps = {
      initialValues: { email: "" },
      onSubmit: vi.fn().mockResolvedValue(undefined),
      submitting: false,
      error: undefined,
    };

    const feedbackProps = {
      loading: false,
      error: undefined,
      isAuthenticated: false,
    };

    expect(createLoginFormModel(formProps)).toBe(formProps);
    expect(createLoginFeedbackModel(feedbackProps)).toBe(feedbackProps);
  });
});
