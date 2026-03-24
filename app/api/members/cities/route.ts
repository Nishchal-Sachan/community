import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import { handleApiError } from "@/lib/api-error";
import { requireActiveMember } from "@/lib/require-active-member";
import { escapeRegex } from "@/lib/member-display";
import { normalizeIndiaState } from "@/lib/india-states";

// GET /api/members/cities?state= — distinct city values for filter dropdown (active members only)
export async function GET(req: NextRequest) {
  try {
    const gate = await requireActiveMember();
    if (!gate.ok) return gate.response;

    const stateParam = req.nextUrl.searchParams.get("state")?.trim();

    await connectDB();

    const match: Record<string, unknown> = {
      isPublic: true,
      city: { $nin: [null, "", "—"] },
    };

    if (stateParam) {
      const norm = normalizeIndiaState(stateParam) ?? stateParam;
      match.state = new RegExp(`^${escapeRegex(norm)}$`, "i");
    }

    const agg = await Member.aggregate([
      { $match: match },
      { $group: { _id: "$city" } },
      { $match: { _id: { $nin: [null, ""] } } },
      { $sort: { _id: 1 } },
      { $limit: 200 },
    ]);

    const cities = agg.map((x) => String(x._id)).filter(Boolean);
    return NextResponse.json({ cities });
  } catch (error) {
    return handleApiError(error, "GET /api/members/cities");
  }
}
