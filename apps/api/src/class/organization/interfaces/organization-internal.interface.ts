import { Document, Types } from "mongoose";
import { IOrganization } from "./organization.interface";

/**
 * Interface: IOrganizationInternal
 * Objective: Extend IOrganization with Mongoose document metadata used internally.
 *
 * Notes:
 * - `_id` uses `Types.ObjectId` because this interface extends Mongoose `Document`.
 * - Intended for repositories, schema typing, and internal persistence operations.
 */
export interface IOrganizationInternal extends IOrganization, Document {
  _id: Types.ObjectId;
}
