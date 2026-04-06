import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters for encryption.");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = "__adm_secure_sid"; // Obscured name
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─── Cookie Options ───────────────────────────────────────────────────────────

export function getCookieOptions(maxAge: number = COOKIE_MAX_AGE): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: "strict",
    path: "/",
    maxAge,
  };
}

// ─── Token Payload ────────────────────────────────────────────────────────────

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  iat?: number;
}

// ─── JWT Utilities (JWE - Encrypted) ──────────────────────────────────────────

/** Encrypts a payload into a JWE. */
export async function signToken(payload: AdminTokenPayload): Promise<string> {
  return await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(secret);
}

/** Decrypts a JWE and returns the payload. */
export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, secret);
    return payload as unknown as AdminTokenPayload;
  } catch (err) {
    return null;
  }
}

/** Reads and verifies the admin token from cookies. */
export async function getAdminFromCookie(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}
