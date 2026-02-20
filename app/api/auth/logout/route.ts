import { NextResponse } from "next/server";
import { getCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

// POST /api/auth/logout
export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    // maxAge: 0 expires the cookie immediately
    response.cookies.set(COOKIE_NAME, "", getCookieOptions(0));
    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/logout");
  }
}
