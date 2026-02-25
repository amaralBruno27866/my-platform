import request from "supertest";
import { Types } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../../app";
import { Privilege } from "../../../common/enums";
import { OrganizationSttus } from "../enums";
import { OrganizationErrorCode } from "../errors";
import {
  clearTestMongo,
  startTestMongo,
  stopTestMongo,
} from "../../../tests/mongo-memory";

function buildCreatePayload(suffix: string) {
  return {
    organizationName: `Acme ${suffix}`,
    legalName: `Acme Legal ${suffix}`,
    acronym: `A${suffix}`.slice(0, 3),
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: `John ${suffix}`,
    organizationEmail: `acme-${suffix.toLowerCase()}@example.com`,
    organizationPhone: "+1 (555) 555-1212",
  };
}

function buildHeaders(privilege: Privilege = Privilege.MASTER) {
  return {
    "x-account-id": new Types.ObjectId().toString(),
    "x-privilege": String(privilege),
  };
}

describe("organization API e2e", () => {
  beforeAll(async () => {
    await startTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  it("creates and reads an organization", async () => {
    const createResponse = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(buildCreatePayload("One"));

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.organizationId).toBeDefined();
    expect(createResponse.body.slug).toBe("acme-one");

    const getResponse = await request(app)
      .get(`/private/organizations/${createResponse.body.organizationId}`)
      .set(buildHeaders());

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.organizationName).toBe("Acme One");
  });

  it("updates, soft deletes and restores an organization", async () => {
    const createResponse = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(buildCreatePayload("Flow"));

    const organizationId = createResponse.body.organizationId;

    const updateResponse = await request(app)
      .patch(`/private/organizations/${organizationId}`)
      .set(buildHeaders())
      .send({ organizationName: "Acme Updated" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.organizationName).toBe("Acme Updated");

    const softDeleteResponse = await request(app)
      .delete(`/private/organizations/${organizationId}`)
      .set(buildHeaders());

    expect(softDeleteResponse.status).toBe(200);
    expect(softDeleteResponse.body.deletedAt).not.toBeNull();

    const restoreResponse = await request(app)
      .post(`/private/organizations/${organizationId}/restore`)
      .set(buildHeaders());

    expect(restoreResponse.status).toBe(200);
    expect(restoreResponse.body.deletedAt).toBeNull();
  });

  it("runs bulk status update and bulk soft delete", async () => {
    const first = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(buildCreatePayload("BulkA"));

    const second = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(buildCreatePayload("BulkB"));

    const ids = [first.body.organizationId, second.body.organizationId];

    const bulkStatusResponse = await request(app)
      .patch("/private/organizations/bulk/status")
      .set(buildHeaders())
      .send({
        organizationIds: ids,
        organizationStatus: OrganizationSttus.SUSPENDED,
      });

    expect(bulkStatusResponse.status).toBe(200);
    expect(bulkStatusResponse.body.matchedCount).toBe(2);
    expect(bulkStatusResponse.body.modifiedCount).toBe(2);

    const bulkDeleteResponse = await request(app)
      .delete("/private/organizations/bulk")
      .set(buildHeaders())
      .send({ organizationIds: ids });

    expect(bulkDeleteResponse.status).toBe(200);
    expect(bulkDeleteResponse.body.matchedCount).toBe(2);
    expect(bulkDeleteResponse.body.modifiedCount).toBe(2);
  });

  it("returns 400 for missing actor headers", async () => {
    const response = await request(app).get("/private/organizations");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("returns 400 for invalid privilege header", async () => {
    const response = await request(app).get("/private/organizations").set({
      "x-account-id": new Types.ObjectId().toString(),
      "x-privilege": "invalid",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("returns 403 for insufficient privilege", async () => {
    const response = await request(app)
      .post("/private/organizations")
      .set(buildHeaders(Privilege.LOW))
      .send(buildCreatePayload("NoPerm"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe(OrganizationErrorCode.FORBIDDEN);
  });

  it("returns 404 for non-existing organization", async () => {
    const response = await request(app)
      .get(`/private/organizations/${new Types.ObjectId().toString()}`)
      .set(buildHeaders());

    expect(response.status).toBe(404);
    expect(response.body.code).toBe(OrganizationErrorCode.NOT_FOUND);
  });

  it("returns 404 for non-existing slug", async () => {
    const response = await request(app)
      .get("/private/organizations/slug/missing-slug")
      .set(buildHeaders());

    expect(response.status).toBe(404);
    expect(response.body.code).toBe(OrganizationErrorCode.NOT_FOUND);
  });

  it("returns 400 for invalid query payload", async () => {
    const response = await request(app)
      .get("/private/organizations")
      .set(buildHeaders())
      .query({ limit: 9999 });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("returns 400 for invalid bulk status payload", async () => {
    const response = await request(app)
      .patch("/private/organizations/bulk/status")
      .set(buildHeaders())
      .send({
        applyToAll: false,
        organizationStatus: OrganizationSttus.ACTIVE,
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("returns 400 for forbidden update fields", async () => {
    const createResponse = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(buildCreatePayload("ForbiddenUpdate"));

    const updateResponse = await request(app)
      .patch(`/private/organizations/${createResponse.body.organizationId}`)
      .set(buildHeaders())
      .send({ organizationId: new Types.ObjectId().toString() });

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.code).toBe(OrganizationErrorCode.BAD_REQUEST);
  });

  it("returns 409 for duplicate unique values", async () => {
    const payload = buildCreatePayload("Dup");

    const first = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/private/organizations")
      .set(buildHeaders())
      .send(payload);

    expect(second.status).toBe(409);
    expect(second.body.code).toBe(OrganizationErrorCode.CONFLICT);
  });
});
