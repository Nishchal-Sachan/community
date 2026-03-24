import { NextResponse } from "next/server";
import { hasActiveMembership } from "@/lib/member-access";
import { getUserFromCookie } from "@/lib/user-auth";
import type { UserTokenPayload } from "@/lib/user-auth";

export type ActiveMemberResult =
  | { ok: true; payload: UserTokenPayload }
  | { ok: false; response: NextResponse };

/**
 * For job portal APIs: must be logged in and membershipStatus === "active" (DB source of truth).
 */
export async function requireActiveMember(): Promise<ActiveMemberResult> {
  const payload = await getUserFromCookie();
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!(await hasActiveMembership(payload))) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "This feature is only available for active members." },
        { status: 403 }
      ),
    };
  }
  return { ok: true, payload };
}
