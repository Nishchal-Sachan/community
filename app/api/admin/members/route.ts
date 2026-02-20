import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";

const PAGE_SIZE = 20;
const MAX_PAGE = 500;

// GET /api/admin/members?page=1 — admin only, returns all members
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { searchParams } = req.nextUrl;
    const raw = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Math.min(MAX_PAGE, Math.max(1, isNaN(raw) ? 1 : raw));
    const skip = (page - 1) * PAGE_SIZE;

    await connectDB();

    const [members, total] = await Promise.all([
      Member.find()
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select("name area joinedAt isPublic")
        .lean(),
      Member.countDocuments(),
    ]);

    return NextResponse.json({
      members: members.map((m) => ({
        _id: (m._id as { toString(): string }).toString(),
        name: m.name,
        area: m.area,
        joinedAt: (m.joinedAt as Date).toISOString(),
        isPublic: m.isPublic,
      })),
      pagination: {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
        hasNextPage: skip + PAGE_SIZE < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/members");
  }
}
