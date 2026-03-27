import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Member from "@/lib/models/Member";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import {
  ensureMemberDirectoryForApprovedUser,
  removeMemberDirectoryForUser,
} from "@/lib/member-directory-sync";
import { displayFullName } from "@/lib/member-display";

// GET /api/admin/users/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid user id");

    await connectDB();
    const user = await User.findById(id).select("-password").lean();
    if (!user) throw new ApiError(404, "User not found");

    const member = await Member.findOne({ userId: id }).lean();
    const name = member
      ? displayFullName(member as { name: string; fullName?: string })
      : user.name;

    const u = user as {
      membership?: { isPaid?: boolean };
      marriageSubscriptionStatus?: string;
      createdAt?: Date;
    };

    return NextResponse.json({
      user: {
        id: String(user._id),
        name,
        email: user.email,
        membershipStatus: user.membershipStatus,
        role: user.role,
        membershipIsPaid: Boolean(u.membership?.isPaid),
        isBlogger: Boolean(user.isBlogger),
        marriageSubscriptionStatus: u.marriageSubscriptionStatus,
        createdAt: u.createdAt,
      },
      member: member
        ? {
            phone: member.phone,
            city: member.city,
            state: member.state,
            area: member.area,
            occupation: member.occupation,
            email: member.email,
            joinedAt: member.joinedAt,
            isPublic: member.isPublic,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/users/:id");
  }
}

// PATCH /api/admin/users/:id — { action: "approve" | "reject" | "remove_directory" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid user id");

    const body = await parseBody(req);
    const action = body?.action as string;
    if (!["approve", "reject", "remove_directory", "toggle_blogger"].includes(action)) {
      throw new ApiError(400, "Invalid action");
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    if (action === "approve") {
      await User.findByIdAndUpdate(id, {
        $set: {
          membershipStatus: "active",
          role: "member",
          "membership.isPaid": true,
        },
      });
      const updated = await User.findById(id).select("name email").lean();
      if (updated) {
        await ensureMemberDirectoryForApprovedUser(id, {
          name: String(updated.name ?? ""),
          email: String(updated.email ?? ""),
        });
      }
    } else if (action === "reject") {
      await removeMemberDirectoryForUser(id);
      await User.findByIdAndUpdate(id, {
        $set: {
          membershipStatus: "none",
          role: "user",
          "membership.isPaid": false,
        },
      });
    } else if (action === "toggle_blogger") {
      await User.findByIdAndUpdate(id, {
        $set: { isBlogger: !user.isBlogger },
      });
    } else {
      await Member.deleteMany({ userId: new mongoose.Types.ObjectId(id) });
      await User.findByIdAndUpdate(id, {
        $set: {
          membershipStatus: "none",
          role: "user",
          "membership.isPaid": false,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/users/:id");
  }
}
