import { LoginInput } from "../models/login-form.types";

export interface LoginFormProps {
  initialValues?: Partial<LoginInput>;
  onSubmit: (values: LoginInput) => Promise<void>;
  submitting?: boolean;
  error?: string;
}

export function createLoginFormModel(props: LoginFormProps): LoginFormProps {
  return props;
}
