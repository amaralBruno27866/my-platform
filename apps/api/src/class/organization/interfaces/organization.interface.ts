import { Types } from "mongoose";
import { AccessModifier } from "../../../common/enums/access-modifier.enum";
import { Privilege } from "../../../common/enums/privilege.enum";
import { OrganizationSttus } from "../enums";

/**
 * Interface: IOrganization
 * Objective: Represent the canonical Organization domain model.
 *
 * Notes:
 * - This interface follows the organization schema contract defined in Organization-Schema.csv.
 * - Optional fields map to fields marked as Optional in the data contract.
 * - Enums are strongly typed to avoid invalid status/privilege/access values.
 */
export interface IOrganization {
  organizationId: Types.ObjectId | string;
  organizationPublicId: string;
  organizationName: string;
  legalName: string;
  acronym: string;
  slug: string;
  organizationLogo: string;
  organizationWebsite: string;
  representativeName: string;
  representativeAccountId?: Types.ObjectId | string;
  organizationEmail?: string;
  organizationAddress?: Types.ObjectId | string;
  organizationPhone?: string;
  organizationStatus: OrganizationSttus;
  privilege: Privilege;
  accessModifier: AccessModifier;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string | null;
}
