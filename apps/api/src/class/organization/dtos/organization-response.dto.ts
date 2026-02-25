import { IOrganization } from "../interfaces/organization.interface";

/**
 * DTO: IOrganizationResponseDTO
 * Objective: Define the standardized shape returned by organization API responses.
 *
 * Notes:
 * - Keeps response typing explicit and stable for controllers/clients.
 * - Can be extended later to omit or transform sensitive/internal fields.
 */
export interface IOrganizationResponseDTO extends Omit<IOrganization, never> {
  organizationId: string;
  organizationPublicId: string;
  organizationName: string;
  legalName: string;
  acronym: string;
  slug: string;
  organizationLogo: string;
  organizationWebsite: string;
  representativeName: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationStatus: IOrganization["organizationStatus"];
  privilege: IOrganization["privilege"];
  accessModifier: IOrganization["accessModifier"];
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
