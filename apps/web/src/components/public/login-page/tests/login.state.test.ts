import { describe, expect, it, vi } from "vitest";
import { LoginState } from "../state/login.state";

describe("login state", () => {
  it("restores session and updates snapshot", async () => {
    const service = {
      getCurrentSession: vi.fn().mockResolvedValue({
        isAuthenticated: true,
        accessToken: "token",
      }),
      login: vi.fn(),
      logout: vi.fn(),
    };

    const state = new LoginState(service as never);
    const restored = await state.restoreSession();

    expect(restored?.isAuthenticated).toBe(true);
    expect(state.value.loading).toBe(false);
    expect(state.value.session?.accessToken).toBe("token");
  });

  it("logs in and stores session", async () => {
    const service = {
      getCurrentSession: vi.fn(),
      login: vi.fn().mockResolvedValue({
        accessToken: "token",
        tokenType: "Bearer",
        expiresIn: 900,
        account: {
          accountId: "acc-1",
          accountPublicId: "ACC-0000001",
          email: "user@myplatform.local",
          privilege: 1,
          accessModifier: 3,
          organizationId: "org-1",
          accountStatus: 1,
        },
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const state = new LoginState(service as never);
    const session = await state.login({
      email: "user@myplatform.local",
      password: "12345678",
    });

    expect(session.isAuthenticated).toBe(true);
    expect(state.value.session?.accessToken).toBe("token");
    expect(state.value.error).toBeUndefined();
  });

  it("handles login failures and unknown errors", async () => {
    const serviceWithError = {
      getCurrentSession: vi.fn(),
      login: vi.fn().mockRejectedValue(new Error("invalid")),
      logout: vi.fn(),
    };

    const stateWithError = new LoginState(serviceWithError as never);
    await expect(
      stateWithError.login({ email: "x", password: "y" }),
    ).rejects.toThrow("invalid");
    expect(stateWithError.value.error).toBe("invalid");

    const serviceWithUnknown = {
      getCurrentSession: vi.fn(),
      login: vi.fn().mockRejectedValue("any-error"),
      logout: vi.fn(),
    };

    const stateWithUnknown = new LoginState(serviceWithUnknown as never);
    await expect(
      stateWithUnknown.login({ email: "x", password: "y" }),
    ).rejects.toBe("any-error");
    expect(stateWithUnknown.value.error).toBe("Unexpected error");
  });

  it("logs out and clears session", async () => {
    const service = {
      getCurrentSession: vi.fn(),
      login: vi.fn().mockResolvedValue({
        accessToken: "token",
        tokenType: "Bearer",
        expiresIn: 900,
        account: {
          accountId: "acc-1",
          accountPublicId: "ACC-0000001",
          email: "user@myplatform.local",
          privilege: 1,
          accessModifier: 3,
          organizationId: "org-1",
          accountStatus: 1,
        },
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const state = new LoginState(service as never);
    await state.login({ email: "user@myplatform.local", password: "12345678" });
    await state.logout();

    expect(state.value.session).toBeNull();
    expect(service.logout).toHaveBeenCalled();
  });
});
