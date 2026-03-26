import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { ApiError, handleApiError } from "@/lib/api-error";
import { jobToPublicJson } from "@/lib/job-public-json";
import { requireActiveMember } from "@/lib/require-active-member";

function formatSalaryLine(
  salaryNote: string,
  salaryMin: string,
  salaryMax: string
): string {
  if (salaryNote.trim()) return salaryNote.trim();
  if (salaryMin.trim() || salaryMax.trim()) {
    return `${salaryMin.trim() || "—"} – ${salaryMax.trim() || "—"}`;
  }
  return "";
}

// GET /api/jobs/:id — full listing (including contact) for active members only
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActiveMember();
    if (!gate.ok) return gate.response;

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid job ID");
    }

    await connectDB();

    const doc = await Job.findById(id).lean();
    if (!doc) throw new ApiError(404, "Not found");

    const j = doc as Record<string, unknown>;
    const base = jobToPublicJson(j) as Record<string, unknown>;
    const listingType = base.type;
    const salary = formatSalaryLine(
      String(base.salaryNote ?? ""),
      String(base.salaryMin ?? ""),
      String(base.salaryMax ?? "")
    );
    const preferredJobType = String(base.preferredJobType ?? "").trim();
    const jobTypeCanon = String(base.jobType ?? "").trim();
    const jobTypeOut =
      listingType === "profile" ? preferredJobType || jobTypeCanon : jobTypeCanon;

    return NextResponse.json({
      job: {
        ...base,
        jobType: jobTypeOut,
        experience: base.experience,
        salary,
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/jobs/:id");
  }
}
