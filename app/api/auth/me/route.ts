import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getUserFromCookie } from "@/lib/user-auth";
import { handleApiError } from "@/lib/api-error";

// GET /api/auth/me — returns current user from JWT cookie
export async function GET() {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.userId)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/auth/me");
  }
}
