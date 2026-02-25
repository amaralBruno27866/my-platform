export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "My Platform API",
    version: "1.0.0",
    description:
      "API documentation for My Platform (MongoDB, Express, Angular, Node.js)",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "API health and status endpoints" },
    {
      name: "Organization",
      description: "Organization management endpoints (privilege 4 only)",
    },
  ],
  components: {
    parameters: {
      ActorAccountIdHeader: {
        name: "x-account-id",
        in: "header",
        required: true,
        description: "Actor account id (ObjectId string)",
        schema: {
          type: "string",
          example: "65f9f0c1aabbccddeeff0011",
        },
      },
      ActorPrivilegeHeader: {
        name: "x-privilege",
        in: "header",
        required: true,
        description:
          "Actor privilege level. Organization endpoints require 4 (MASTER)",
        schema: {
          type: "integer",
          enum: [1, 2, 3, 4],
          example: 4,
        },
      },
      OrganizationIdPath: {
        name: "id",
        in: "path",
        required: true,
        description: "Organization business id (organizationId)",
        schema: {
          type: "string",
          example: "65f9f0c1aabbccddeeff0010",
        },
      },
      OrganizationSlugPath: {
        name: "slug",
        in: "path",
        required: true,
        description: "Organization slug",
        schema: {
          type: "string",
          example: "my-organization",
        },
      },
    },
    schemas: {
      RootResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "api" },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          mongo: {
            type: "string",
            enum: [
              "connected",
              "disconnected",
              "connecting",
              "disconnecting",
              "unknown",
            ],
            example: "connected",
          },
          uptime: { type: "number", example: 123.45 },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      OrganizationCreate: {
        type: "object",
        required: [
          "organizationName",
          "legalName",
          "acronym",
          "organizationLogo",
          "organizationWebsite",
          "representativeName",
        ],
        properties: {
          organizationName: { type: "string", example: "My Organization" },
          legalName: { type: "string", example: "My Organization Inc." },
          acronym: { type: "string", example: "ORG" },
          organizationLogo: {
            type: "string",
            format: "uri",
            example: "https://example.com/logo.png",
          },
          organizationWebsite: {
            type: "string",
            format: "uri",
            example: "https://example.com",
          },
          representativeName: { type: "string", example: "Maria da Silva" },
          representativeAccountId: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0011",
          },
          organizationEmail: {
            type: "string",
            format: "email",
            example: "contact@example.com",
          },
          organizationAddress: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0012",
          },
          organizationPhone: { type: "string", example: "(555) 555-5555" },
        },
      },
      OrganizationUpdate: {
        type: "object",
        description:
          "Partial update payload. At least one editable field is required.",
        properties: {
          organizationName: {
            type: "string",
            example: "My Organization Updated",
          },
          legalName: {
            type: "string",
            example: "My Organization Inc. Updated",
          },
          acronym: { type: "string", example: "MOU" },
          slug: { type: "string", example: "my-organization-updated" },
          organizationLogo: {
            type: "string",
            format: "uri",
            example: "https://example.com/new-logo.png",
          },
          organizationWebsite: {
            type: "string",
            format: "uri",
            example: "https://new-example.com",
          },
          representativeName: { type: "string", example: "Maria Souza" },
          representativeAccountId: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0012",
          },
          organizationEmail: {
            type: "string",
            format: "email",
            example: "new-contact@example.com",
          },
          organizationAddress: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0013",
          },
          organizationPhone: { type: "string", example: "+1 (555) 555-7777" },
        },
      },
      OrganizationResponse: {
        type: "object",
        properties: {
          organizationId: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0010",
          },
          organizationPublicId: { type: "string", example: "ORG-000001" },
          organizationName: { type: "string", example: "My Organization" },
          legalName: { type: "string", example: "My Organization Inc." },
          acronym: { type: "string", example: "ORG" },
          slug: { type: "string", example: "my-organization" },
          organizationLogo: {
            type: "string",
            format: "uri",
            example: "https://example.com/logo.png",
          },
          organizationWebsite: {
            type: "string",
            format: "uri",
            example: "https://example.com",
          },
          representativeName: { type: "string", example: "Maria da Silva" },
          representativeAccountId: {
            type: "string",
            nullable: true,
            example: "65f9f0c1aabbccddeeff0011",
          },
          organizationEmail: {
            type: "string",
            nullable: true,
            example: "c***@example.com",
          },
          organizationAddress: {
            type: "string",
            nullable: true,
            example: "65f9f0c1aabbccddeeff0012",
          },
          organizationPhone: {
            type: "string",
            nullable: true,
            example: "***-***-1212",
          },
          organizationStatus: { type: "integer", example: 1 },
          privilege: { type: "integer", example: 4 },
          accessModifier: { type: "integer", example: 3 },
          createdBy: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0014",
          },
          updatedBy: {
            type: "string",
            nullable: true,
            example: "65f9f0c1aabbccddeeff0015",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      OrganizationListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/OrganizationResponse",
            },
          },
          total: { type: "integer", example: 2 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
        },
      },
      OrganizationBulkUpdateStatusRequest: {
        type: "object",
        required: ["organizationStatus"],
        properties: {
          applyToAll: { type: "boolean", default: false, example: false },
          organizationIds: {
            type: "array",
            items: { type: "string" },
            example: ["65f9f0c1aabbccddeeff0010", "65f9f0c1aabbccddeeff0016"],
          },
          organizationStatus: {
            type: "integer",
            enum: [1, 2, 3, 4],
            example: 3,
          },
          includeDeleted: { type: "boolean", default: false, example: false },
        },
      },
      OrganizationBulkSoftDeleteRequest: {
        type: "object",
        properties: {
          applyToAll: { type: "boolean", default: false, example: false },
          organizationIds: {
            type: "array",
            items: { type: "string" },
            example: ["65f9f0c1aabbccddeeff0010", "65f9f0c1aabbccddeeff0016"],
          },
          includeDeleted: { type: "boolean", default: false, example: false },
        },
      },
      OrganizationBulkOperationResponse: {
        type: "object",
        properties: {
          matchedCount: { type: "integer", example: 2 },
          modifiedCount: { type: "integer", example: 2 },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          code: { type: "string", example: "ORGANIZATION_BAD_REQUEST" },
          details: {
            nullable: true,
            oneOf: [{ type: "object" }, { type: "array" }, { type: "string" }],
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "Conflict",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      InternalServerError: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Health check endpoint",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RootResponse",
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Detailed health check",
        responses: {
          "200": {
            description: "API and service status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/private/organizations": {
      post: {
        tags: ["Organization"],
        summary: "Create organization",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrganizationCreate",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Organization created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "409": { $ref: "#/components/responses/Conflict" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      get: {
        tags: ["Organization"],
        summary: "List organizations",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "slug",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "includeDeleted",
            in: "query",
            schema: { type: "boolean", default: false },
          },
        ],
        responses: {
          "200": {
            description: "Organization list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationListResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/private/organizations/slug/{slug}": {
      get: {
        tags: ["Organization"],
        summary: "Get organization by slug",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          { $ref: "#/components/parameters/OrganizationSlugPath" },
        ],
        responses: {
          "200": {
            description: "Organization found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/private/organizations/{id}": {
      get: {
        tags: ["Organization"],
        summary: "Get organization by id",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          { $ref: "#/components/parameters/OrganizationIdPath" },
        ],
        responses: {
          "200": {
            description: "Organization found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      patch: {
        tags: ["Organization"],
        summary: "Update organization",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          { $ref: "#/components/parameters/OrganizationIdPath" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrganizationUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Organization updated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        tags: ["Organization"],
        summary: "Soft delete organization",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          { $ref: "#/components/parameters/OrganizationIdPath" },
        ],
        responses: {
          "200": {
            description: "Organization soft deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/private/organizations/{id}/restore": {
      post: {
        tags: ["Organization"],
        summary: "Restore soft deleted organization",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
          { $ref: "#/components/parameters/OrganizationIdPath" },
        ],
        responses: {
          "200": {
            description: "Organization restored",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/private/organizations/bulk/status": {
      patch: {
        tags: ["Organization"],
        summary: "Bulk update organization status",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrganizationBulkUpdateStatusRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Bulk status update completed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationBulkOperationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/private/organizations/bulk": {
      delete: {
        tags: ["Organization"],
        summary: "Bulk soft delete organizations",
        parameters: [
          { $ref: "#/components/parameters/ActorAccountIdHeader" },
          { $ref: "#/components/parameters/ActorPrivilegeHeader" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrganizationBulkSoftDeleteRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Bulk soft delete completed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationBulkOperationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/api-docs": {
      get: {
        tags: ["Health"],
        summary: "Swagger UI",
        description: "OpenAPI interactive documentation page",
        responses: {
          "200": {
            description: "Swagger UI HTML",
          },
        },
      },
    },
  },
};
