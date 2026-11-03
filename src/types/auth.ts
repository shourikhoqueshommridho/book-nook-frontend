/**
 * Minimal user shape for the navbar profile dropdown and user-dependent UI.
 * Populated by Better Auth's useSession hook (see src/lib/auth-client.ts).
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
