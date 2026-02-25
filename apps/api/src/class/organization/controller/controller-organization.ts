import { Request, Response, Router } from "express";
import { Privilege } from "../../../common/enums";
import {
  organizationCommandService,
  organizationLookupService,
  OrganizationActorContext,
} from "../services";

export const organizationRouter = Router();

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
    throw new Error("Missing actor headers: x-account-id and x-privilege");
  }

  const privilege = Number(privilegeRaw);
  if (!Object.values(Privilege).includes(privilege as Privilege)) {
    throw new Error("Invalid x-privilege header");
  }

  return {
    accountId,
    privilege: privilege as Privilege,
  };
}

function handleControllerError(error: unknown, res: Response): void {
  const message = error instanceof Error ? error.message : "Unexpected error";

  if (
    message.includes("Invalid") ||
    message.includes("Missing actor headers") ||
    message.includes("At least one field") ||
    message.includes("Provide organizationIds") ||
    message.includes("Forbidden update fields")
  ) {
    res.status(400).json({ message });
    return;
  }

  if (message.includes("Insufficient privilege")) {
    res.status(403).json({ message });
    return;
  }

  if (message.includes("not found")) {
    res.status(404).json({ message });
    return;
  }

  res.status(500).json({ message });
}

organizationRouter.post("/", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const created = await organizationCommandService.createOrganization(
      req.body,
      actor,
    );

    res.status(201).json(created);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.get("/", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const result = await organizationLookupService.listOrganizations(
      req.query,
      actor,
    );

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const found = await organizationLookupService.getOrganizationBySlug(
      getPathParam(req, "slug"),
      actor,
    );

    res.status(200).json(found);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const found = await organizationLookupService.getOrganizationById(
      getPathParam(req, "id"),
      actor,
    );

    res.status(200).json(found);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const updated = await organizationCommandService.updateOrganization(
      getPathParam(req, "id"),
      req.body,
      actor,
    );

    res.status(200).json(updated);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const deleted = await organizationCommandService.softDeleteOrganization(
      getPathParam(req, "id"),
      actor,
    );

    res.status(200).json(deleted);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.post("/:id/restore", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const restored = await organizationCommandService.restoreOrganization(
      getPathParam(req, "id"),
      actor,
    );

    res.status(200).json(restored);
  } catch (error) {
    handleControllerError(error, res);
  }
});

organizationRouter.patch(
  "/bulk/status",
  async (req: Request, res: Response) => {
    try {
      const actor = parseActorContext(req);
      const result =
        await organizationCommandService.bulkUpdateOrganizationStatus(
          req.body,
          actor,
        );

      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, res);
    }
  },
);

organizationRouter.delete("/bulk", async (req: Request, res: Response) => {
  try {
    const actor = parseActorContext(req);
    const result = await organizationCommandService.bulkSoftDeleteOrganizations(
      req.body,
      actor,
    );

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res);
  }
});
