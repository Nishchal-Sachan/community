"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type MembershipStatus = "none" | "pending" | "active";

export type MarriageSubscriptionStatus = "none" | "active";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  membership: { isPaid: boolean };
  membershipStatus: MembershipStatus;
  marriageSubscriptionStatus: MarriageSubscriptionStatus;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => void;
}

export function useCurrentUser(): UseCurrentUserResult {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        if (u) {
          setUser({
            ...u,
            membershipStatus: u.membershipStatus ?? "none",
            marriageSubscriptionStatus:
              u.marriageSubscriptionStatus === "active" ? "active" : "none",
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  return { user, loading, refetch: fetchUser };
}
