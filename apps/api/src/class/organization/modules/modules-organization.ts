import { Express } from "express";
import { organizationRouter } from "../controller";

export const ORGANIZATION_MODULE_BASE_PATH = "/private/organizations";

export function registerOrganizationModule(app: Express): void {
  app.use(ORGANIZATION_MODULE_BASE_PATH, organizationRouter);
}
