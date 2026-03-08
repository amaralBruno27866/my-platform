import { Request, Response, Router } from "express";
import { Privilege } from "../../../common/enums";
import { HttpStatus, OrganizationBadRequestError } from "../errors";
import {
  organizationCommandService,
  organizationLookupService,
  OrganizationActorContext,
} from "../services";
import { asyncHandler } from "../../../request-handling";

export const organizationRouter = Router();

/**
 * Safely extracts path parameters from Express request.
 * Handles edge case where parameter could be an array (rare in standard Express routing).
 * istanbul ignore next - Array case is rare in practice, defensive programming
 */
function getPathParam(req: Request, key: string): string {
  const rawValue = req.params[key];

  if (Array.isArray(rawValue)) {
    return rawValue[0] ?? "";
  }

  return rawValue ?? "";
}

function parseActorContext(req: Request): OrganizationActorContext {
  const accountId = req.header("x-account-id");
  const privilegeRaw = req.header("x-privilege");

  if (!accountId || !privilegeRaw) {
    throw new OrganizationBadRequestError(
      "Missing actor headers: x-account-id and x-privilege",
    );
  }

  const privilege = Number(privilegeRaw);
  if (!Object.values(Privilege).includes(privilege as Privilege)) {
    throw new OrganizationBadRequestError("Invalid x-privilege header");
  }

  return {
    accountId,
    privilege: privilege as Privilege,
  };
}

// ✅ Using asyncHandler - Global error handler catches all errors automatically
organizationRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const created = await organizationCommandService.createOrganization(
      req.body,
      actor,
    );
    res.status(HttpStatus.CREATED).json(created);
  }),
);

organizationRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const result = await organizationLookupService.listOrganizations(
      req.query,
      actor,
    );
    res.status(HttpStatus.OK).json(result);
  }),
);

organizationRouter.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const found = await organizationLookupService.getOrganizationBySlug(
      getPathParam(req, "slug"),
      actor,
    );
    res.status(HttpStatus.OK).json(found);
  }),
);

organizationRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const found = await organizationLookupService.getOrganizationById(
      getPathParam(req, "id"),
      actor,
    );
    res.status(HttpStatus.OK).json(found);
  }),
);

organizationRouter.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const updated = await organizationCommandService.updateOrganization(
      getPathParam(req, "id"),
      req.body,
      actor,
    );
    res.status(HttpStatus.OK).json(updated);
  }),
);

organizationRouter.delete(
  "/bulk",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const result = await organizationCommandService.bulkSoftDeleteOrganizations(
      req.body,
      actor,
    );
    res.status(HttpStatus.OK).json(result);
  }),
);

organizationRouter.post(
  "/:id/restore",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const restored = await organizationCommandService.restoreOrganization(
      getPathParam(req, "id"),
      actor,
    );
    res.status(HttpStatus.OK).json(restored);
  }),
);

organizationRouter.patch(
  "/bulk/status",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const result =
      await organizationCommandService.bulkUpdateOrganizationStatus(
        req.body,
        actor,
      );
    res.status(HttpStatus.OK).json(result);
  }),
);

organizationRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const actor = parseActorContext(req);
    const deleted = await organizationCommandService.softDeleteOrganization(
      getPathParam(req, "id"),
      actor,
    );
    res.status(HttpStatus.OK).json(deleted);
  }),
);
