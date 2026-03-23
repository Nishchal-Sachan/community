"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  membership: { isPaid: boolean };
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
        setUser(data.user ?? null);
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
