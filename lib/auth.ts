import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { crypto } from "next/dist/compiled/@edge-runtime/primitives"; // Edge-compatible crypto

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters for encryption.");
}

// Derive a 256-bit key from the JWT_SECRET to ensure compatibility with A256GCM.
const getEncryptionKey = async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JWT_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
};

export const COOKIE_NAME = "__adm_secure_sid";
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
  const secret = await getEncryptionKey();
  return await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(secret);
}

/** Decrypts a JWE and returns the payload. */
export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secret = await getEncryptionKey();
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
