import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { signToken, getCookieOptions, COOKIE_NAME } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { rateLimit, getClientIp, LOGIN_RATE_LIMIT } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 320; // RFC 5321 max email length

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rl = rateLimit(
      `login:${ip}`,
      LOGIN_RATE_LIMIT.limit,
      LOGIN_RATE_LIMIT.windowMs
    );

    if (!rl.allowed) {
      const minutes = Math.ceil(rl.retryAfter / 60);
      return NextResponse.json(
        {
          error: `Too many login attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        }
      );
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const { email, password } = body;

    // ── Validate fields ────────────────────────────────────────────────────
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new ApiError(400, "Email is required");
    }
    if (email.trim().length > MAX_FIELD_LENGTH) {
      throw new ApiError(400, "Email is too long");
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new ApiError(400, "Invalid email format");
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      throw new ApiError(400, "Password is required");
    }
    if (typeof password === "string" && password.length > 1024) {
      throw new ApiError(400, "Password is too long");
    }

    // ── Authenticate ───────────────────────────────────────────────────────
    await connectDB();

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // Generic message to prevent user enumeration
    if (!admin || !(await admin.comparePassword(password as string))) {
      throw new ApiError(401, "Invalid credentials");
    }

    // ── Issue JWT cookie ───────────────────────────────────────────────────
    const token = signToken({ adminId: admin._id.toString(), email: admin.email });

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, getCookieOptions());

    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/login");
  }
}
