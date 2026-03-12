import { describe, expect, it } from "vitest";
import { LoginMockProvider } from "../mock/login.mock-provider";

describe("login mock provider", () => {
  it("logs in with valid credentials and stores session", async () => {
    const provider = new LoginMockProvider();

    const result = await provider.login({
      email: "user@myplatform.local",
      password: "12345678",
    });

    expect(result.accessToken).toBe("mock-access-token");
    expect(result.tokenType).toBe("Bearer");

    const session = await provider.getCurrentSession();
    expect(session?.isAuthenticated).toBe(true);
  });

  it("rejects invalid credentials", async () => {
    const provider = new LoginMockProvider();

    await expect(
      provider.login({ email: "wrong@myplatform.local", password: "x" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("clears session on logout", async () => {
    const provider = new LoginMockProvider();

    await provider.login({
      email: "user@myplatform.local",
      password: "12345678",
    });
    await provider.logout();

    await expect(provider.getCurrentSession()).resolves.toBeNull();
  });
});
