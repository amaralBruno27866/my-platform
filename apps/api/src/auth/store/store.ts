import { Types } from "mongoose";
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthMeResponse,
  AuthSignupRequest,
  AuthSignupResponse,
} from "../contracts";
import {
  authAccountInactiveError,
  authAccountNotFoundError,
  authEmailConflictError,
  authInvalidCredentialsError,
} from "../errors";
import { hashPassword, verifyPassword } from "../password";
import { signAccessToken } from "../token";

export enum AuthAccountStatus {
  ACTIVE = 1,
  PENDING = 2,
  INACTIVE = 3,
}

interface AuthAccountRecord {
  accountId: string;
  accountPublicId: string;
  firstName: string;
  lastName: string;
  email: string;
  cellphone?: string;
  passwordHash: string;
  accountGroup: number;
  accountStatus: number;
  privilege: number;
  accessModifier: number;
  organizationId: string;
  createdAt: string;
  updatedAt?: string | null;
}

class InMemoryAuthStore {
  private sequence = 1;
  private byId = new Map<string, AuthAccountRecord>();
  private byEmail = new Map<string, AuthAccountRecord>();

  signup(input: AuthSignupRequest): AuthSignupResponse {
    const normalizedEmail = input.email.trim().toLowerCase();

    if (this.byEmail.has(normalizedEmail)) {
      throw authEmailConflictError(normalizedEmail);
    }

    const now = new Date().toISOString();
    const accountId = new Types.ObjectId().toString();

    const record: AuthAccountRecord = {
      accountId,
      accountPublicId: `ACC-${String(this.sequence).padStart(7, "0")}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizedEmail,
      cellphone: input.cellphone,
      passwordHash: hashPassword(input.password),
      accountGroup: input.accountGroup,
      accountStatus: AuthAccountStatus.PENDING,
      privilege: 1,
      accessModifier: 3,
      organizationId: input.organizationId,
      createdAt: now,
      updatedAt: now,
    };

    this.sequence += 1;
    this.byId.set(record.accountId, record);
    this.byEmail.set(record.email, record);

    return {
      accountId: record.accountId,
      accountPublicId: record.accountPublicId,
      accountStatus: record.accountStatus,
      message: "Account created successfully",
    };
  }

  login(input: AuthLoginRequest): AuthLoginResponse {
    const normalizedEmail = input.email.trim().toLowerCase();
    const account = this.byEmail.get(normalizedEmail);

    if (!account) {
      throw authInvalidCredentialsError();
    }

    if (!verifyPassword(input.password, account.passwordHash)) {
      throw authInvalidCredentialsError();
    }

    if (account.accountStatus === AuthAccountStatus.INACTIVE) {
      throw authAccountInactiveError();
    }

    const accessToken = signAccessToken({
      sub: account.accountId,
      accountPublicId: account.accountPublicId,
      email: account.email,
      privilege: account.privilege,
      accessModifier: account.accessModifier,
      accountStatus: account.accountStatus,
      organizationId: account.organizationId,
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 60 * 15,
      account: {
        accountId: account.accountId,
        accountPublicId: account.accountPublicId,
        email: account.email,
        privilege: account.privilege,
        accessModifier: account.accessModifier,
        organizationId: account.organizationId,
        accountStatus: account.accountStatus,
      },
    };
  }

  me(accountId: string): AuthMeResponse {
    const account = this.byId.get(accountId);

    if (!account) {
      throw authAccountNotFoundError();
    }

    return {
      accountId: account.accountId,
      accountPublicId: account.accountPublicId,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      cellphone: account.cellphone,
      privilege: account.privilege,
      accessModifier: account.accessModifier,
      accountGroup: account.accountGroup,
      accountStatus: account.accountStatus,
      organizationId: account.organizationId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}

export const authStore = new InMemoryAuthStore();
