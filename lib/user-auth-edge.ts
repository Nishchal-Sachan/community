/**
 * Edge-compatible JWT verification for user auth (middleware).
 */
import { jwtVerify } from "jose";

export const USER_COOKIE_NAME = "auth_token";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

export interface UserTokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function verifyUserTokenEdge(token: string): Promise<UserTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string | undefined;
    const email = payload.email as string | undefined;
    const role = payload.role as string | undefined;
    if (!userId || !email) return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}

export function getUserTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`${USER_COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}
