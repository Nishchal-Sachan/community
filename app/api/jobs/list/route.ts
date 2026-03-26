import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { handleApiError } from "@/lib/api-error";
import { jobToPublicJson } from "@/lib/job-public-json";
import { requireActiveMember } from "@/lib/require-active-member";

// GET /api/jobs/list?type=job|profile&category=...&search=...
export async function GET(req: NextRequest) {
  try {
    const gate = await requireActiveMember();
    if (!gate.ok) return gate.response;
    const { payload } = gate;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (type === "job" || type === "profile") {
      query.type = type;
    } else if (type) {
      return NextResponse.json(
        { error: "Invalid type. Use 'job' or 'profile'" },
        { status: 400 }
      );
    }

    if (category && typeof category === "string") {
      query.category = { $regex: category.trim().slice(0, 100), $options: "i" };
    }

    if (search && typeof search === "string") {
      const term = search.trim().slice(0, 200);
      if (term) {
        query.$or = [
          { title: { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
          { location: { $regex: term, $options: "i" } },
          { jobRole: { $regex: term, $options: "i" } },
          { company: { $regex: term, $options: "i" } },
          { companyName: { $regex: term, $options: "i" } },
          { skills: { $regex: term, $options: "i" } },
          { skillsRequired: { $regex: term, $options: "i" } },
          { candidateSkills: { $regex: term, $options: "i" } },
          { education: { $regex: term, $options: "i" } },
          { bio: { $regex: term, $options: "i" } },
          { preferredJobType: { $regex: term, $options: "i" } },
        ];
      }
    }

    await connectDB();

    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

    const list = jobs.map((j) => {
      const isOwner =
        (j.createdBy as { toString(): string }).toString() === payload.userId;
      const pub = jobToPublicJson(j as Record<string, unknown>) as Record<
        string,
        unknown
      >;
      return {
        ...pub,
        ...(isOwner
          ? {
              contactPhone: j.contactPhone,
              contactEmail: j.contactEmail,
            }
          : {}),
      };
    });

    return NextResponse.json({ jobs: list });
  } catch (error) {
    return handleApiError(error, "GET /api/jobs/list");
  }
}
