"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getJoinRedirect } from "@/lib/join-redirect";

interface JoinLinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable Join link that redirects based on auth state:
 * - Not logged in → /login
 * - role=user → /join
 * - role=member → /members
 */
export function JoinLink({ children, className, onClick }: JoinLinkProps) {
  const { user, loading } = useCurrentUser();
  const href = loading ? "/login" : getJoinRedirect(user);

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
