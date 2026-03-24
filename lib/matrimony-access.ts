import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { resolveMembershipStatus } from "@/lib/member-access";
import type { UserTokenPayload } from "@/lib/user-auth";

type UserLean = {
  membershipStatus?: string;
  role?: string;
  membership?: { isPaid?: boolean };
  marriageSubscriptionStatus?: string;
} | null;

export type MatrimonyViewerContext = {
  userId: string;
  isActiveMember: boolean;
  hasMarriageSubscription: boolean;
};

export function resolveMarriageSubscriptionStatus(user: UserLean): "none" | "active" {
  const s = user?.marriageSubscriptionStatus;
  return s === "active" ? "active" : "none";
}

/** Viewer context for matrimony APIs (DB-backed). */
export async function getMatrimonyViewerContext(
  payload: UserTokenPayload | null
): Promise<MatrimonyViewerContext | null> {
  if (!payload?.userId) return null;

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("membershipStatus role membership.isPaid marriageSubscriptionStatus")
    .lean();

  if (!user) return null;

  const u = user as UserLean;
  const membershipStatus = resolveMembershipStatus(u);
  const isActiveMember = membershipStatus === "active";
  const hasMarriageSubscription = resolveMarriageSubscriptionStatus(u) === "active";

  return {
    userId: payload.userId,
    isActiveMember,
    hasMarriageSubscription,
  };
}
