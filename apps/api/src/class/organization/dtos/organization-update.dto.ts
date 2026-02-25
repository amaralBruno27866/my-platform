import { IOrganization } from "../interfaces/organization.interface";

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
