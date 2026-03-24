/**
 * Returns the redirect URL for "Join" actions based on auth state and role.
 * Used by JoinLink and any component that needs join destination logic.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  membership: { isPaid: boolean };
}

export function getJoinRedirect(user: AuthUser | null): string {
  if (!user) return "/login";
  return "/members";
}
