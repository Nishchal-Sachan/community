import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";

// DELETE /api/events/:id — admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid event ID");
    }

    await connectDB();

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Event not found");

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/events/:id");
  }
}
