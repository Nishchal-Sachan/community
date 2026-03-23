import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { getUserFromCookie } from "@/lib/user-auth";
import { ApiError, handleApiError } from "@/lib/api-error";

// DELETE /api/jobs/delete/:id — owner only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid job ID");
    }

    await connectDB();

    const job = await Job.findById(id);
    if (!job) throw new ApiError(404, "Job not found");

    if (job.createdBy.toString() !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Job removed successfully",
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/jobs/delete/:id");
  }
}
