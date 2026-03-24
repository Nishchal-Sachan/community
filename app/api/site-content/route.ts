import { NextResponse } from "next/server";
import { getMergedSiteContent } from "@/lib/get-site-content";
import { handleApiError } from "@/lib/api-error";

// GET /api/site-content — public merged homepage content
export async function GET() {
  try {
    const content = await getMergedSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    return handleApiError(error, "GET /api/site-content");
  }
}
