import { IOrganization } from "./organization.interface";

/**
 * DTO: IOrganizationCreateDTO
 * Objective: Define the allowed input payload for organization creation.
 *
 * Notes:
 * - Includes business fields expected from client input.
 * - System-managed fields (ids, audit fields, defaults) are handled by services/schema.
 */
export interface IOrganizationCreateDTO {
  organizationName: string;
  legalName: string;
  acronym: string;
  organizationLogo: string;
  organizationWebsite: string;
  representativeName: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
}

/**
 * Backward-compatible alias for create payload.
 */
export type IOrganizationDTO = IOrganizationCreateDTO;

/**
 * DTO: IOrganizationUpdateDTO
 * Objective: Define a partial payload for controlled organization updates.
 *
 * Notes:
 * - All fields are optional to support PATCH/partial update semantics.
 * - Permission checks (e.g., privilege 4) must be enforced in service/rules layers.
 */
export interface IOrganizationUpdateDTO {
  organizationName?: string;
  legalName?: string;
  acronym?: string;
  slug?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
  representativeName?: string;
  representativeAccountId?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationStatus?: IOrganization["organizationStatus"];
  privilege?: IOrganization["privilege"];
  accessModifier?: IOrganization["accessModifier"];
}

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
