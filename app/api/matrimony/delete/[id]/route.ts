import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Matrimony from "@/lib/models/Matrimony";
import { getUserFromCookie } from "@/lib/user-auth";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";

// DELETE /api/matrimony/delete/:id — owner only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viewer = await getMatrimonyViewerContext(payload);
    if (!viewer?.isActiveMember) {
      return NextResponse.json(
        { error: "यह सुविधा केवल सदस्यों के लिए उपलब्ध है" },
        { status: 403 }
      );
    }
    if (!viewer.hasMarriageSubscription) {
      return NextResponse.json(
        { error: "Marriage subscription required to delete a profile" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid profile ID");
    }

    await connectDB();

    const profile = await Matrimony.findById(id);
    if (!profile) throw new ApiError(404, "Profile not found");

    if (profile.createdBy.toString() !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await Matrimony.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Profile removed successfully",
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/matrimony/delete/:id");
  }
}
