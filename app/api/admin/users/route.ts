import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Member from "@/lib/models/Member";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";
import { displayFullName } from "@/lib/member-display";

// GET /api/admin/users — directory + account status
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    await connectDB();

    const [users, members] = await Promise.all([
      User.find()
        .select("name email membershipStatus role createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Member.find().select("userId phone city state name fullName").lean(),
    ]);

    const byUser = new Map<string, (typeof members)[0]>();
    for (const m of members) {
      if (m.userId) byUser.set(String(m.userId), m);
    }

    return NextResponse.json({
      users: users.map((u) => {
        const m = byUser.get(String(u._id));
        const name = m ? displayFullName(m as { name: string; fullName?: string }) : u.name;
        return {
          id: String(u._id),
          name,
          email: u.email,
          phone: m?.phone ?? "—",
          city: m?.city ?? "—",
          state: m?.state ?? "—",
          status: u.membershipStatus ?? "none",
          role: u.role,
        };
      }),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/users");
  }
}
