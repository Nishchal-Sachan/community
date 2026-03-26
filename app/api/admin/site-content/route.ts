import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SiteContent, { type SiteSectionKey } from "@/lib/models/SiteContent";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { getMergedSiteContent } from "@/lib/get-site-content";

const SECTIONS: SiteSectionKey[] = [
  "hero",
  "cta",
  "leadership",
  "home_images",
  "gallery",
  "impact",
];

// PUT /api/admin/site-content — replace one section's `data`
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const body = await parseBody(req);
    if (!body || typeof body !== "object") throw new ApiError(400, "Invalid JSON body");

    const section = body.section as string;
    const data = body.data;

    if (!section || !SECTIONS.includes(section as SiteSectionKey)) {
      throw new ApiError(400, "Invalid section");
    }
    if (data === undefined || typeof data !== "object" || Array.isArray(data)) {
      throw new ApiError(400, "data must be an object");
    }

    await connectDB();

    await SiteContent.findOneAndUpdate(
      { section },
      { $set: { data: data as Record<string, unknown> } },
      { upsert: true, new: true, runValidators: false }
    );

    const content = await getMergedSiteContent();
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    return handleApiError(error, "PUT /api/admin/site-content");
  }
}
