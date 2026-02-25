import {
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "../models/organization-form.types";

export interface OrganizationFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<OrganizationCreateInput & OrganizationUpdateInput>;
  onSubmit: (
    values: OrganizationCreateInput | OrganizationUpdateInput,
  ) => Promise<void>;
  submitting?: boolean;
}

export function createOrganizationFormModel(
  props: OrganizationFormProps,
): OrganizationFormProps {
  return props;
}
