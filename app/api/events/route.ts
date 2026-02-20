import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

// GET /api/events — public
export async function GET(req: NextRequest) {
  try {
    void req;
    await connectDB();

    const events = await Event.find()
      .sort({ date: 1 })
      .select("title description date imageUrl createdAt")
      .lean();

    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error, "GET /api/events");
  }
}

// POST /api/events — admin only
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const { title, description, date, imageUrl } = body;

    // ── Presence checks ────────────────────────────────────────────────────
    const missing: string[] = [];
    if (!title || typeof title !== "string" || !title.trim()) missing.push("title");
    if (!description || typeof description !== "string" || !description.trim()) missing.push("description");
    if (!date) missing.push("date");
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) missing.push("imageUrl");

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
    }

    // ── Length guards ──────────────────────────────────────────────────────
    if ((title as string).trim().length > 150) throw new ApiError(400, "Title is too long (max 150 characters)");
    if ((description as string).trim().length > 2000) throw new ApiError(400, "Description is too long (max 2000 characters)");
    if ((imageUrl as string).trim().length > 2048) throw new ApiError(400, "Image URL is too long");

    // ── Date validation ────────────────────────────────────────────────────
    const parsedDate = new Date(date as string);
    if (isNaN(parsedDate.getTime())) throw new ApiError(400, "Invalid date format");

    await connectDB();

    const event = await Event.create({
      title: (title as string).trim(),
      description: (description as string).trim(),
      date: parsedDate,
      imageUrl: (imageUrl as string).trim(),
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/events");
  }
}
