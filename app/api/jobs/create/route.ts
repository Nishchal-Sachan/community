import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { requireActiveMember } from "@/lib/require-active-member";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { JOB_MAX_LENGTHS } from "@/lib/job-field-limits";
import { jobToPublicJson } from "@/lib/job-public-json";
import { validateJobPostingFields } from "@/lib/validate-job-posting";
import { validateSeekerProfileFields } from "@/lib/validate-job-seeker-profile";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function sanitizeString(val: unknown, maxLen: number): string {
  return String(val ?? "")
    .trim()
    .slice(0, maxLen);
}

function validateCreateBody(body: unknown): {
  type: "job" | "profile";
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const b = body as Record<string, unknown>;
  const type = b.type === "job" || b.type === "profile" ? b.type : null;
  const title = sanitizeString(b.title, JOB_MAX_LENGTHS.title);
  const description = sanitizeString(b.description, JOB_MAX_LENGTHS.description);
  const category = sanitizeString(b.category, JOB_MAX_LENGTHS.category);
  const location = sanitizeString(b.location, JOB_MAX_LENGTHS.location);
  const contactName = sanitizeString(b.contactName, JOB_MAX_LENGTHS.contactName);
  const contactPhone = sanitizeString(b.contactPhone, JOB_MAX_LENGTHS.contactPhone);
  const contactEmail = sanitizeString(b.contactEmail, JOB_MAX_LENGTHS.contactEmail).toLowerCase();

  if (!type) throw new ApiError(400, "Type must be 'job' or 'profile'");
  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Description is required");
  if (!category) throw new ApiError(400, "Category is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!contactName) throw new ApiError(400, "Contact name is required");
  if (!contactPhone) throw new ApiError(400, "Contact phone is required");
  if (!contactEmail) throw new ApiError(400, "Contact email is required");
  if (!EMAIL_REGEX.test(contactEmail)) throw new ApiError(400, "Invalid contact email format");

  return {
    type,
    title,
    description,
    category,
    location,
    contactName,
    contactPhone,
    contactEmail,
  };
}

// POST /api/jobs/create
export async function POST(req: NextRequest) {
  try {
    const gate = await requireActiveMember();
    if (!gate.ok) return gate.response;
    const { payload } = gate;

    const body = await parseBody(req);
    /** Parsed JSON body (App Router has no `req.body` — this is the equivalent). */
    console.log("REQ BODY:", body);

    if (!body) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    if (!body.title || !body.category) {
      return NextResponse.json({ message: "Required fields missing" }, { status: 400 });
    }

    const common = validateCreateBody(body);

    await connectDB();

    if (common.type === "job") {
      const posting = validateJobPostingFields(body as Record<string, unknown>);
      const job = new Job({
        ...common,
        ...posting,
        createdBy: payload.userId,
      });
      await job.save();
      console.log("SAVED JOB:", job.toObject());

      return NextResponse.json(
        {
          message: "Job created successfully",
          job: jobToPublicJson(job),
        },
        { status: 201 }
      );
    }

    const seeker = validateSeekerProfileFields(body as Record<string, unknown>);
    const job = new Job({
      ...common,
      ...seeker,
      createdBy: payload.userId,
    });
    await job.save();
    console.log("SAVED JOB:", job.toObject());

    return NextResponse.json(
      {
        message: "Profile created successfully",
        job: jobToPublicJson(job),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "POST /api/jobs/create");
  }
}
