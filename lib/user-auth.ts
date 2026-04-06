import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 chars");
}

const getEncryptionKey = async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JWT_SECRET);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
};

export const USER_COOKIE_NAME = "__session_id"; // Obscured
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; 

export function getUserCookieOptions(maxAge: number = COOKIE_MAX_AGE): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  };
}

export interface UserTokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
}

/** Signs a JWE. */
export async function signUserToken(payload: UserTokenPayload): Promise<string> {
  const secret = await getEncryptionKey();
  return await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(secret);
}

/** Decrypts a JWE. */
export async function verifyUserToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const secret = await getEncryptionKey();
    const { payload } = await jwtDecrypt(token, secret);
    return payload as unknown as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getUserFromCookie(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyUserToken(token);
}
