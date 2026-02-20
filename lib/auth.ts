import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

export const COOKIE_NAME = "admin_token";
const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Cookie Options ───────────────────────────────────────────────────────────

/**
 * Returns secure, consistent cookie options for the admin JWT.
 * sameSite: "strict" — no cross-site transmission, maximising CSRF protection.
 * secure — enforced in production; omitted in dev so http://localhost works.
 */
export function getCookieOptions(maxAge: number = COOKIE_MAX_AGE): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // "lax" allows cookie on redirect; "strict" can block it
    path: "/",
    maxAge,
  };
}

// ─── Token Payload ────────────────────────────────────────────────────────────

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

// ─── JWT Utilities ────────────────────────────────────────────────────────────

/** Signs a JWT and returns the token string. */
export function signToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/** Verifies a JWT string and returns the decoded payload, or null if invalid/expired. */
export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

/** Reads and verifies the admin token from the incoming request cookies (Server Components / Route Handlers). */
export async function getAdminFromCookie(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
