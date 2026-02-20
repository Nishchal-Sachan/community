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
      const errMsg = `Too many login attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
      const isForm = (req.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
      if (isForm) {
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("error", errMsg);
        return NextResponse.redirect(loginUrl, { status: 302 });
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    // ── Parse body (JSON or form) ──────────────────────────────────────────
    const contentType = req.headers.get("content-type") ?? "";
    let email: string;
    let password: string;
    let redirectTo: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      email = (formData.get("email") as string) ?? "";
      password = (formData.get("password") as string) ?? "";
      redirectTo = (formData.get("redirect") as string) || null;
    } else {
      const body = await parseBody(req);
      if (!body) throw new ApiError(400, "Invalid JSON body");
      email = (body.email as string) ?? "";
      password = (body.password as string) ?? "";
      redirectTo = (body.redirect as string) || req.headers.get("x-login-redirect");
    }

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

    // ── Issue JWT cookie and redirect ───────────────────────────────────────
    const token = signToken({ adminId: admin._id.toString(), email: admin.email });

    const target = redirectTo ?? "/admin/dashboard";
    const safeRedirect = target.startsWith("/") && !target.startsWith("//") ? target : "/admin/dashboard";

    const response = NextResponse.redirect(new URL(safeRedirect, req.url), { status: 302 });
    response.cookies.set(COOKIE_NAME, token, getCookieOptions());
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    return response;
  } catch (error) {
    const isForm = (req.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
    if (isForm && error instanceof ApiError) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl, { status: 302 });
    }
    return handleApiError(error, "POST /api/auth/login");
  }
}
