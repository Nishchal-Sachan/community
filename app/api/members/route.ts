import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

const PAGE_SIZE = 12;
const MAX_PAGE = 1000;

// GET /api/members?page=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const raw = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Math.min(MAX_PAGE, Math.max(1, isNaN(raw) ? 1 : raw));
    const skip = (page - 1) * PAGE_SIZE;

    await connectDB();

    const [members, total] = await Promise.all([
      Member.find({ isPublic: true })
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select("name area joinedAt")
        .lean(),
      Member.countDocuments({ isPublic: true }),
    ]);

    return NextResponse.json({
      members,
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
    return handleApiError(error, "GET /api/members");
  }
}

// POST /api/members — public endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const { name, phone, area } = body;

    // ── Presence & type checks ─────────────────────────────────────────────
    const missing: string[] = [];
    if (!name || typeof name !== "string" || !name.trim()) missing.push("name");
    if (!phone || typeof phone !== "string" || !phone.trim()) missing.push("phone");
    if (!area || typeof area !== "string" || !area.trim()) missing.push("area");

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
    }

    // ── Length guards (belt-and-suspenders before hitting the model) ───────
    if ((name as string).trim().length > 100) throw new ApiError(400, "Name is too long (max 100 characters)");
    if ((phone as string).trim().length > 20) throw new ApiError(400, "Phone number is too long (max 20 characters)");
    if ((area as string).trim().length > 100) throw new ApiError(400, "Area is too long (max 100 characters)");

    await connectDB();

    const member = await Member.create({
      name: (name as string).trim(),
      phone: (phone as string).trim(),
      area: (area as string).trim(),
    });

    return NextResponse.json(
      {
        message: "You have successfully joined!",
        member: {
          id: member._id,
          name: member.name,
          area: member.area,
          joinedAt: member.joinedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "POST /api/members");
  }
}
