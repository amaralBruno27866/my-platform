export interface LoginFeedbackProps {
  loading: boolean;
  error?: string;
  isAuthenticated: boolean;
}

export function createLoginFeedbackModel(
  props: LoginFeedbackProps,
): LoginFeedbackProps {
  return props;
}
