export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Use at least 6 characters, including one uppercase letter (A-Z) and one lowercase letter (a-z).";

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password)
  );
}
