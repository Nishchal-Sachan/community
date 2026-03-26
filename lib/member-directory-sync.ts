import mongoose from "mongoose";
import Member from "@/lib/models/Member";

/** Placeholder until we store phone on User; valid for Member.phone regex. */
const PLACEHOLDER_PHONE = "0000000000";

/**
 * Ensure a directory row exists for an approved member so they appear on /members.
 * Payment flow also creates/updates Member; manual admin approve must do the same.
 */
export async function ensureMemberDirectoryForApprovedUser(
  userId: string,
  user: { name: string; email: string },
): Promise<void> {
  const oid = new mongoose.Types.ObjectId(userId);
  const name = user.name.trim();
  const email = user.email.trim().toLowerCase();

  const existing = await Member.findOne({ userId: oid }).lean();

  if (existing) {
    await Member.updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          fullName: name,
          email,
          isPublic: true,
        },
      },
    );
    return;
  }

  await Member.create({
    userId: oid,
    name,
    fullName: name,
    email,
    phone: PLACEHOLDER_PHONE,
    area: "",
    isPublic: true,
    joinedAt: new Date(),
  });
}

/** Remove directory listing when membership is rejected or removed. */
export async function removeMemberDirectoryForUser(userId: string): Promise<void> {
  await Member.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
}
