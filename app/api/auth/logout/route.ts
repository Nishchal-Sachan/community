import { NextResponse } from "next/server";
import { getCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { getUserCookieOptions, USER_COOKIE_NAME } from "@/lib/user-auth";
import { handleApiError } from "@/lib/api-error";

// POST /api/auth/logout — clears user JWT (auth_token) and admin token
export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    response.cookies.set(USER_COOKIE_NAME, "", getUserCookieOptions(0));
    response.cookies.set(COOKIE_NAME, "", getCookieOptions(0));
    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/logout");
  }
}
