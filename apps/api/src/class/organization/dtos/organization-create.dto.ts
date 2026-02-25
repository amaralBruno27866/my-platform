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
