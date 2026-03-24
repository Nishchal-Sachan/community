/**
 * Edge-compatible JWT verification for middleware.
 * Uses jose (Web Crypto) instead of jsonwebtoken (Node crypto).
 */
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to .env or .env.local (see .env.example).");
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

export async function verifyTokenEdge(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const adminId = payload.adminId as string | undefined;
    const email = payload.email as string | undefined;
    if (!adminId || !email) return null;
    return { adminId, email };
  } catch {
    return null;
  }
}
