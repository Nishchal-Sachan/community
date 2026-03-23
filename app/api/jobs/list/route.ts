import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { handleApiError } from "@/lib/api-error";

// GET /api/jobs/list?type=job|profile&category=...&search=...
export async function GET(req: NextRequest) {
  try {
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
        ];
      }
    }

    await connectDB();

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const list = jobs.map((j) => ({
      id: (j._id as { toString(): string }).toString(),
      createdBy: (j.createdBy as { toString(): string }).toString(),
      type: j.type,
      title: j.title,
      description: j.description,
      category: j.category,
      location: j.location,
      contactName: j.contactName,
      contactPhone: j.contactPhone,
      contactEmail: j.contactEmail,
      createdAt: j.createdAt,
    }));

    return NextResponse.json({ jobs: list });
  } catch (error) {
    return handleApiError(error, "GET /api/jobs/list");
  }
}
