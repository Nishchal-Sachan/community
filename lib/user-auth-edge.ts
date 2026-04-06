import { jwtDecrypt } from "jose";

export const USER_COOKIE_NAME = "__session_id";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 chars");
}

const getEncryptionKey = async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JWT_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
};

export interface UserTokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function verifyUserTokenEdge(token: string): Promise<UserTokenPayload | null> {
  try {
    const secret = await getEncryptionKey();
    const { payload } = await jwtDecrypt(token, secret);
    const userId = payload.userId as string | undefined;
    const email = payload.email as string | undefined;
    const role = payload.role as string | undefined;
    if (!userId || !email) return null;
    return { userId, email, role } as UserTokenPayload;
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
