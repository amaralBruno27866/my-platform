import { AuthenticatedUserView } from "../models/login.types";

export const loginMockCredentials = {
  email: "user@myplatform.local",
  password: "12345678",
};

export const loginMockAccount: AuthenticatedUserView = {
  accountId: "acc-1",
  accountPublicId: "ACC-0000001",
  email: "user@myplatform.local",
  privilege: 1,
  accessModifier: 3,
  organizationId: "org-1",
  accountStatus: 1,
};
