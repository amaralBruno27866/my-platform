import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore, AuthAccountStatus } from "../store";
import { redisCacheService } from "../../infra/redis";

function resetAuthStore(): void {
  const mutableStore = authStore as unknown as {
    sequence: number;
    byId: Map<string, unknown>;
    byEmail: Map<string, unknown>;
  };

  mutableStore.sequence = 1;
  mutableStore.byId.clear();
  mutableStore.byEmail.clear();
}

describe("auth store", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.restoreAllMocks();
  });

  it("signup, login, me and token activity flow", async () => {
    vi.spyOn(redisCacheService, "setJson").mockResolvedValue();
    vi.spyOn(redisCacheService, "getJson").mockResolvedValue({
      accountId: "unknown",
    });

    const signup = await authStore.signup({
      firstName: "John",
      lastName: "Doe",
      email: "john+1@mail.com",
      cellphone: "(416) 555-1212",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 1,
      organizationId: "org-1",
    });

    expect(signup.accountPublicId).toBe("ACC-0000001");

    const login = await authStore.login({
      email: "john+1@mail.com",
      password: "12345678",
    });

    expect(login.tokenType).toBe("Bearer");
    expect(login.account.accountStatus).toBe(AuthAccountStatus.PENDING);

    const me = await authStore.me(login.account.accountId);
    expect(me.email).toBe("john+1@mail.com");

    const active = await authStore.ensureTokenIsActive(
      login.accessToken,
      login.account.accountId,
    );
    expect(active).toBe(false);

    vi.spyOn(redisCacheService, "getJson").mockResolvedValue(null);
    const fallbackActive = await authStore.ensureTokenIsActive(
      login.accessToken,
      login.account.accountId,
    );
    expect(fallbackActive).toBe(true);
  });

  it("rejects duplicate email and invalid login", async () => {
    await authStore.signup({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 2,
      organizationId: "org-1",
    });

    await expect(
      authStore.signup({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@mail.com",
        password: "12345678",
        acceptanceTerm: true,
        accountGroup: 2,
        organizationId: "org-1",
      }),
    ).rejects.toThrow("Email is already in use");

    await expect(
      authStore.login({ email: "jane@mail.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");

    await expect(
      authStore.login({ email: "no@mail.com", password: "x" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("blocks inactive accounts and missing profile lookup", async () => {
    await authStore.signup({
      firstName: "Block",
      lastName: "Me",
      email: "inactive@mail.com",
      password: "12345678",
      acceptanceTerm: true,
      accountGroup: 2,
      organizationId: "org-1",
    });

    const mutableStore = authStore as unknown as {
      byEmail: Map<string, { accountStatus: number }>;
    };

    const account = mutableStore.byEmail.get("inactive@mail.com");
    if (account) {
      account.accountStatus = AuthAccountStatus.INACTIVE;
    }

    await expect(
      authStore.login({ email: "inactive@mail.com", password: "12345678" }),
    ).rejects.toThrow("Account is inactive");

    await expect(authStore.me("missing-id")).rejects.toThrow(
      "Account not found",
    );
  });

  it("uses fail-open strategy when Redis is unavailable (returns true)", async () => {
    // This test documents the current behavior: when Redis fails to return session data,
    // ensureTokenIsActive returns true (fail-open) for availability over security.
    // This is intentional for development but should be reviewed for production.
    vi.spyOn(redisCacheService, "getJson").mockResolvedValue(null);

    const isActive = await authStore.ensureTokenIsActive(
      "any-token",
      "any-account-id",
    );

    expect(isActive).toBe(true);
  });

  it("validates session matches account ID when Redis is available", async () => {
    vi.spyOn(redisCacheService, "getJson").mockResolvedValue({
      accountId: "correct-account",
    });

    const validSession = await authStore.ensureTokenIsActive(
      "token-1",
      "correct-account",
    );
    expect(validSession).toBe(true);

    const mismatchSession = await authStore.ensureTokenIsActive(
      "token-1",
      "wrong-account",
    );
    expect(mismatchSession).toBe(false);
  });
});
