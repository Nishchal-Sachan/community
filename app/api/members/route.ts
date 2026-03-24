import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import User from "@/lib/models/User";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasFullMemberAccess } from "@/lib/member-access";
import { displayFullName, deriveCityStateFromArea, escapeRegex } from "@/lib/member-display";
import { normalizeIndiaState } from "@/lib/india-states";

const PAGE_SIZE = 12;
const MAX_PAGE = 1000;

function buildMemberListMatch(
  fullAccess: boolean,
  filters: { q: string; state: string; city: string }
): Record<string, unknown> {
  const base: Record<string, unknown> = { isPublic: true };
  if (!fullAccess) return base;

  const parts: object[] = [base];

  const q = filters.q.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    parts.push({
      $or: [{ name: rx }, { fullName: rx }, { city: rx }, { occupation: rx }],
    });
  }

  const stateRaw = filters.state.trim();
  if (stateRaw) {
    const norm = normalizeIndiaState(stateRaw) ?? stateRaw;
    parts.push({ state: new RegExp(`^${escapeRegex(norm)}$`, "i") });
  }

  const cityRaw = filters.city.trim().slice(0, 80);
  if (cityRaw) {
    parts.push({ city: new RegExp(escapeRegex(cityRaw), "i") });
  }

  return parts.length === 1 ? base : { $and: parts };
}

// GET /api/members?page=1&q=&state=&city=  (filters only for full member access)
export async function GET(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    const fullAccess = await hasFullMemberAccess(payload);

    const { searchParams } = req.nextUrl;
    const raw = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Math.min(MAX_PAGE, Math.max(1, isNaN(raw) ? 1 : raw));
    const skip = (page - 1) * PAGE_SIZE;

    const qRaw = (searchParams.get("q") ?? "").trim().slice(0, 100);
    const stateRaw = (searchParams.get("state") ?? "").trim().slice(0, 80);
    const cityRaw = (searchParams.get("city") ?? "").trim().slice(0, 80);

    const filters = fullAccess
      ? { q: qRaw, state: stateRaw, city: cityRaw }
      : { q: "", state: "", city: "" };

    const match = buildMemberListMatch(fullAccess, filters);

    await connectDB();

    const selectFields = fullAccess
      ? "name fullName area city state phone email occupation joinedAt userId"
      : "name fullName";

    const [members, total] = await Promise.all([
      Member.find(match)
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select(selectFields)
        .lean(),
      Member.countDocuments(match),
    ]);

    type LeanMember = {
      _id: unknown;
      userId?: unknown;
      name: string;
      fullName?: string;
      area?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
      occupation?: string;
      joinedAt?: Date;
    };

    const emailByUserId = new Map<string, string>();
    if (fullAccess && members.length > 0) {
      const ids = [
        ...new Set(
          (members as LeanMember[])
            .map((m) => (m.userId != null ? String(m.userId) : null))
            .filter((id): id is string => Boolean(id))
        ),
      ];
      if (ids.length > 0) {
        const users = await User.find({ _id: { $in: ids } })
          .select("email")
          .lean();
        for (const u of users) {
          const e = (u as { email?: string }).email;
          if (e) emailByUserId.set(String(u._id), e);
        }
      }
    }

    const serialized = (members as LeanMember[]).map((m) => {
      const fullName = displayFullName(m);
      if (!fullAccess) {
        return { _id: String(m._id), fullName };
      }

      const emailFromUser =
        m.userId != null ? emailByUserId.get(String(m.userId)) : undefined;
      const email =
        m.email != null && String(m.email).trim() !== ""
          ? String(m.email).trim()
          : emailFromUser ?? "";

      let city = (m.city ?? "").trim();
      let state = (m.state ?? "").trim();
      if (!city && !state) {
        const d = deriveCityStateFromArea(m.area);
        city = d.city;
        state = d.state;
      }

      const membershipDate =
        m.joinedAt != null ? (m.joinedAt as Date).toISOString() : "";

      return {
        _id: String(m._id),
        fullName,
        email: email || "—",
        phone: (m.phone ?? "").trim() || "—",
        city: city || "—",
        state: state || "—",
        occupation: (m.occupation ?? "").trim() || "—",
        membershipDate,
      };
    });

    return NextResponse.json({
      members: serialized,
      restricted: !fullAccess,
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

    const missing: string[] = [];
    if (!name || typeof name !== "string" || !name.trim()) missing.push("name");
    if (!phone || typeof phone !== "string" || !phone.trim()) missing.push("phone");
    if (!area || typeof area !== "string" || !area.trim()) missing.push("area");

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
    }

    if ((name as string).trim().length > 100) throw new ApiError(400, "Name is too long (max 100 characters)");
    if ((phone as string).trim().length > 20) throw new ApiError(400, "Phone number is too long (max 20 characters)");
    if ((area as string).trim().length > 100) throw new ApiError(400, "Area is too long (max 100 characters)");

    const nm = (name as string).trim();
    const ar = (area as string).trim();
    const derived = deriveCityStateFromArea(ar);

    await connectDB();

    const member = await Member.create({
      name: nm,
      fullName: nm,
      phone: (phone as string).trim(),
      area: ar,
      ...(derived.city !== "—" ? { city: derived.city } : {}),
      ...(derived.state !== "—" ? { state: derived.state } : {}),
    });

    return NextResponse.json(
      {
        message: "You have successfully joined!",
        member: {
          id: member._id,
          fullName: displayFullName(member),
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
