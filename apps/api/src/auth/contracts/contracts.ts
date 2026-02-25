export const AUTH_ROUTES = {
  signup: "/public/auth/signup",
  login: "/public/auth/login",
  me: "/private/auth/me",
} as const;

export enum AuthErrorCode {
  VALIDATION_ERROR = "AUTH_VALIDATION_ERROR",
  INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  ACCOUNT_NOT_FOUND = "AUTH_ACCOUNT_NOT_FOUND",
  ACCOUNT_INACTIVE = "AUTH_ACCOUNT_INACTIVE",
  EMAIL_ALREADY_IN_USE = "AUTH_EMAIL_ALREADY_IN_USE",
  UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  FORBIDDEN = "AUTH_FORBIDDEN",
}

export interface AuthSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  cellphone?: string;
  password: string;
  acceptanceTerm: boolean;
  accountGroup: number;
  organizationId: string;
}

export interface AuthSignupResponse {
  accountId: string;
  accountPublicId: string;
  accountStatus: number;
  message: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  account: {
    accountId: string;
    accountPublicId: string;
    email: string;
    privilege: number;
    accessModifier: number;
    organizationId: string;
    accountStatus: number;
  };
}

export interface AuthMeResponse {
  accountId: string;
  accountPublicId: string;
  firstName: string;
  lastName: string;
  email: string;
  cellphone?: string;
  privilege: number;
  accessModifier: number;
  accountGroup: number;
  accountStatus: number;
  organizationId: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AuthErrorResponse {
  message: string;
  code: AuthErrorCode;
  details?: unknown;
}
