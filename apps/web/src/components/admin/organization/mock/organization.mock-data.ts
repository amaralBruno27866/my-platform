import {
  OrganizationStatus,
  OrganizationView,
} from "../models/organization.types";

export const organizationMockData: OrganizationView[] = [
  {
    organizationId: "65f9f0c1aabbccddeeff0010",
    organizationPublicId: "ORG-000001",
    organizationName: "My Organization",
    legalName: "My Organization Inc.",
    acronym: "ORG",
    slug: "my-organization",
    organizationLogo: "https://example.com/logo.png",
    organizationWebsite: "https://example.com",
    representativeName: "Maria da Silva",
    representativeAccountId: "65f9f0c1aabbccddeeff0011",
    organizationEmail: "contact@example.com",
    organizationAddress: "65f9f0c1aabbccddeeff0012",
    organizationPhone: "+1 (555) 555-1212",
    organizationStatus: OrganizationStatus.ACTIVE,
    privilege: 4,
    accessModifier: 3,
    createdBy: "65f9f0c1aabbccddeeff0014",
    updatedBy: "65f9f0c1aabbccddeeff0015",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];
