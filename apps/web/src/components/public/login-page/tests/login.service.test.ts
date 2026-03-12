import { describe, expect, it, vi } from "vitest";
import { LoginService } from "../services/login.service";

describe("login service", () => {
  it("delegates provider operations", async () => {
    const provider = {
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
      getCurrentSession: vi.fn().mockResolvedValue(null),
    };

    const service = new LoginService(provider as never);

    await expect(
      service.login({ email: "user@myplatform.local", password: "12345678" }),
    ).resolves.toMatchObject({ accessToken: "token" });
    await expect(service.getCurrentSession()).resolves.toBeNull();
    await expect(service.logout()).resolves.toBeUndefined();

    expect(provider.login).toHaveBeenCalledWith({
      email: "user@myplatform.local",
      password: "12345678",
    });
    expect(provider.getCurrentSession).toHaveBeenCalled();
    expect(provider.logout).toHaveBeenCalled();
  });
});
