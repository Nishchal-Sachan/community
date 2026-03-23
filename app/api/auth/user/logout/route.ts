import { NextResponse } from "next/server";
import { getUserCookieOptions, USER_COOKIE_NAME } from "@/lib/user-auth";

// POST /api/auth/user/logout
export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
  response.cookies.set(USER_COOKIE_NAME, "", getUserCookieOptions(0));
  return response;
}
