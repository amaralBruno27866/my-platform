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
    { name: "Health Check", description: "API health and status endpoints" },
    {
      name: "Private Organization Operations",
      description: "Organization management (privilege 4 only)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
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
      OrganizationResponse: {
        type: "object",
        properties: {
          organizationId: {
            type: "string",
            example: "65f9f0c1aabbccddeeff0010",
          },
          organizationPublicId: { type: "string", example: "ORG-000001" },
          organizationName: { type: "string", example: "My Organization" },
          slug: { type: "string", example: "my-organization" },
          organizationStatus: { type: "integer", example: 1 },
          privilege: { type: "integer", example: 4 },
          accessModifier: { type: "integer", example: 3 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation error" },
          code: { type: "string", example: "BAD_REQUEST" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health Check"],
        summary: "Health check endpoint",
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health Check"],
        summary: "Detailed health check",
        responses: {
          "200": {
            description: "API and service status",
          },
        },
      },
    },
  },
};
