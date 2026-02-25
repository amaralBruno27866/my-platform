import { model, models, Schema, Types } from "mongoose";
import { AccessModifier, Privilege } from "../../../common/enums";
import { ORGANIZATION_COLLECTION, ORGANIZATION_DEFAULTS } from "../constants";
import { OrganizationSttus } from "../enums";
import { IOrganizationInternal } from "../interfaces";

/**
 * Model name used by Mongoose model registry.
 */
export const ORGANIZATION_MODEL_NAME = "Organization";

const NAME_LOWERCASE_PARTICLES = new Set([
  "and",
  "of",
  "the",
  "in",
  "on",
  "at",
  "for",
  "to",
]);

function getNumericEnumValues(source: object): number[] {
  return Object.values(source).filter(
    (value): value is number => typeof value === "number",
  );
}

function toTitleCaseWithParticles(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (index > 0 && NAME_LOWERCASE_PARTICLES.has(lowerWord)) {
        return lowerWord;
      }

      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(" ");
}

/**
 * Schema: Organization
 * Objective: Persist and validate the Organization entity according to Organization-Schema.csv.
 */
export const organizationSchema = new Schema<IOrganizationInternal>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    organizationPublicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      set: toTitleCaseWithParticles,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      set: toTitleCaseWithParticles,
    },
    acronym: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    organizationLogo: {
      type: String,
      required: true,
      trim: true,
    },
    organizationWebsite: {
      type: String,
      required: true,
      trim: true,
    },
    representativeName: {
      type: String,
      required: true,
      trim: true,
      set: toTitleCaseWithParticles,
    },
    representativeAccountId: {
      type: Schema.Types.ObjectId,
      ref: "account",
      required: false,
      index: true,
    },
    organizationEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      index: true,
    },
    organizationAddress: {
      type: Schema.Types.ObjectId,
      ref: "address",
      required: false,
    },
    organizationPhone: {
      type: String,
      required: false,
      trim: true,
    },
    organizationStatus: {
      type: Number,
      enum: getNumericEnumValues(OrganizationSttus),
      default: ORGANIZATION_DEFAULTS.status,
      required: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      required: false,
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "account.me",
      required: true,
      immutable: true,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "account.me",
      required: false,
      index: true,
    },
    privilege: {
      type: Number,
      enum: getNumericEnumValues(Privilege),
      default: ORGANIZATION_DEFAULTS.privilege,
      required: true,
    },
    accessModifier: {
      type: Number,
      enum: getNumericEnumValues(AccessModifier),
      default: ORGANIZATION_DEFAULTS.accessModifier,
      required: true,
    },
  },
  {
    collection: ORGANIZATION_COLLECTION,
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
);

organizationSchema.index(
  { organizationName: "text" },
  { name: "organization-name_text" },
);
organizationSchema.index(
  { organizationEmail: 1 },
  {
    unique: true,
    name: "organization-email_1",
    partialFilterExpression: {
      organizationEmail: { $exists: true, $ne: "" },
    },
  },
);

export const OrganizationModel =
  models[ORGANIZATION_MODEL_NAME] ||
  model<IOrganizationInternal>(ORGANIZATION_MODEL_NAME, organizationSchema);
