export interface AuthenticatedUserView {
  accountId: string;
  accountPublicId: string;
  email: string;
  privilege: number;
  accessModifier: number;
  organizationId: string;
  accountStatus: number;
}

export interface LoginSuccessResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  account: AuthenticatedUserView;
}

export interface LoginSessionView {
  isAuthenticated: boolean;
  accessToken?: string;
  expiresAt?: string;
  account?: AuthenticatedUserView;
}
