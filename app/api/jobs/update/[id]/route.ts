import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

function validateProfileUpdateBody(body: unknown): {
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
  const title = sanitizeString(b.title, JOB_MAX_LENGTHS.title);
  const description = sanitizeString(b.description, JOB_MAX_LENGTHS.description);
  const category = sanitizeString(b.category, JOB_MAX_LENGTHS.category);
  const location = sanitizeString(b.location, JOB_MAX_LENGTHS.location);
  const contactName = sanitizeString(b.contactName, JOB_MAX_LENGTHS.contactName);
  const contactPhone = sanitizeString(b.contactPhone, JOB_MAX_LENGTHS.contactPhone);
  const contactEmail = sanitizeString(b.contactEmail, JOB_MAX_LENGTHS.contactEmail).toLowerCase();

  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Description is required");
  if (!category) throw new ApiError(400, "Category is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!contactName) throw new ApiError(400, "Contact name is required");
  if (!contactPhone) throw new ApiError(400, "Contact phone is required");
  if (!contactEmail) throw new ApiError(400, "Contact email is required");
  if (!EMAIL_REGEX.test(contactEmail)) throw new ApiError(400, "Invalid contact email format");

  return {
    title,
    description,
    category,
    location,
    contactName,
    contactPhone,
    contactEmail,
  };
}

// PUT /api/jobs/update/:id — owner only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireActiveMember();
    if (!gate.ok) return gate.response;
    const { payload } = gate;

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid job ID");
    }

    const body = await parseBody(req);
    console.log("REQ BODY:", body);

    await connectDB();

    const job = await Job.findById(id);
    if (!job) throw new ApiError(404, "Job not found");

    if (job.createdBy.toString() !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (job.type === "profile") {
      const data = validateProfileUpdateBody(body);
      const seeker = validateSeekerProfileFields(body as Record<string, unknown>);
      job.set({
        ...data,
        ...seeker,
      });
      job.markModified("skills");
      job.jobRole = undefined;
      job.jobType = undefined;
      job.salaryMin = undefined;
      job.salaryMax = undefined;
      job.salaryNote = undefined;
      job.company = undefined;
      job.remote = false;
    } else {
      const data = validateProfileUpdateBody(body);
      const extras = validateJobPostingFields(body as Record<string, unknown>);
      job.set({
        ...data,
        ...extras,
      });
      job.salaryMin = extras.salaryMin.trim() ? extras.salaryMin : undefined;
      job.salaryMax = extras.salaryMax.trim() ? extras.salaryMax : undefined;
      job.salaryNote = extras.salaryNote.trim() ? extras.salaryNote : undefined;
      job.markModified("skills");
      job.preferredJobType = undefined;
      job.education = undefined;
      job.bio = undefined;
    }


    await job.save();
    console.log("SAVED JOB:", job.toObject());

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: jobToPublicJson(job),
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/jobs/update/:id");
  }
}
