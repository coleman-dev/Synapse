export type SignUpValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
export type SignInValues = { email: string; password: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const PASSWORD_REQUIREMENTS =
  '15+ characters, including uppercase and lowercase\nletters, a number, and a special character.';

export function emailError(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? undefined
    : 'Enter a valid email address.';
}

export function passwordError(value: string) {
  return value.length >= 15 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9\s]/.test(value)
    ? undefined
    : 'Use 15+ characters, uppercase, lowercase, a number, and a special character.';
}

export function validateSignUp(values: SignUpValues): FieldErrors<SignUpValues> {
  const errors: FieldErrors<SignUpValues> = {};
  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name.';
  const email = emailError(values.email);
  const password = passwordError(values.password);
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (!values.confirmPassword || values.password !== values.confirmPassword)
    errors.confirmPassword = 'Passwords must match.';
  return errors;
}

export function validateSignIn(values: SignInValues): FieldErrors<SignInValues> {
  const errors: FieldErrors<SignInValues> = {};
  const email = emailError(values.email);
  if (email) errors.email = email;
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}
