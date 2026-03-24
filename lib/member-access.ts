import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import type { UserMembershipStatus } from "@/lib/models/User";
import type { UserTokenPayload } from "@/lib/user-auth";

type LeanUser = {
  membershipStatus?: string;
  role?: string;
  membership?: { isPaid?: boolean };
} | null;

/**
 * Resolve status from DB document. Legacy users (no membershipStatus) use role + isPaid.
 */
export function resolveMembershipStatus(user: LeanUser): UserMembershipStatus {
  if (!user) return "none";
  const s = user.membershipStatus;
  if (s === "active" || s === "pending" || s === "none") return s;
  if (user.role === "member" && user.membership?.isPaid) return "active";
  return "none";
}

export async function getMembershipStatus(
  payload: UserTokenPayload | null
): Promise<UserMembershipStatus> {
  if (!payload?.userId) return "none";

  await connectDB();
  const user = await User.findById(payload.userId)
    .select("role membership.isPaid membershipStatus")
    .lean();

  return resolveMembershipStatus(user as LeanUser);
}

/** Paid / active members — full members portal, directory, job portal. */
export async function hasActiveMembership(
  payload: UserTokenPayload | null
): Promise<boolean> {
  const status = await getMembershipStatus(payload);
  return status === "active";
}

/**
 * Full member portal access (same as active membership).
 * Determined from the database, not only the JWT.
 */
export async function hasFullMemberAccess(
  payload: UserTokenPayload | null
): Promise<boolean> {
  return hasActiveMembership(payload);
}
