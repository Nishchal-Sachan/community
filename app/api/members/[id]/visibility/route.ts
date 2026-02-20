import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";

// PATCH /api/members/:id/visibility — admin only
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid member ID");
    }

    await connectDB();

    const member = await Member.findById(id);
    if (!member) throw new ApiError(404, "Member not found");

    member.isPublic = !member.isPublic;
    await member.save();

    return NextResponse.json({
      member: {
        _id: member._id.toString(),
        isPublic: member.isPublic,
      },
    });
  } catch (error) {
    return handleApiError(error, "PATCH /api/members/:id/visibility");
  }
}
