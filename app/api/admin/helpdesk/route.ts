import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import HelpRequest from "@/lib/models/HelpRequest";
import { ApiError, handleApiError } from "@/lib/api-error";

// GET /api/admin/helpdesk — list help requests (newest first)
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    await connectDB();
    const rows = await HelpRequest.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({
      requests: rows.map((r) => ({
        id: String(r._id),
        name: r.name,
        phone: r.phone,
        category: r.category,
        urgency: r.urgency,
        createdAt:
          r.createdAt instanceof Date
            ? r.createdAt.toISOString()
            : String(r.createdAt),
        resolved: Boolean(r.resolved),
      })),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/helpdesk");
  }
}
