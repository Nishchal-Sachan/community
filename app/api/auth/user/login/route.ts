import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import {
  signUserToken,
  getUserCookieOptions,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { resolveMembershipStatus } from "@/lib/member-access";
import { rateLimit, getClientIp, LOGIN_RATE_LIMIT } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/user/login
export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rl = rateLimit(
      `user-login:${ip}`,
      LOGIN_RATE_LIMIT.limit,
      LOGIN_RATE_LIMIT.windowMs
    );

    if (!rl.allowed) {
      const minutes = Math.ceil(rl.retryAfter / 60);
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const email = (body.email as string) ?? "";
    const password = (body.password as string) ?? "";

    if (!email || typeof email !== "string" || !email.trim()) {
      throw new ApiError(400, "Email is required");
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new ApiError(400, "Invalid email format");
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      throw new ApiError(400, "Password is required");
    }

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = signUserToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const membershipStatus = resolveMembershipStatus(
      user as {
        membershipStatus?: string;
        role?: string;
        membership?: { isPaid?: boolean };
      }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          membershipStatus,
        },
      },
      { status: 200 }
    );

    response.cookies.set(USER_COOKIE_NAME, token, getUserCookieOptions());

    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/user/login");
  }
}
