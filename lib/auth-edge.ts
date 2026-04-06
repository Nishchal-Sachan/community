import { jwtDecrypt } from "jose";

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

export interface AdminTokenPayload {
  adminId: string;
  email: string;
}

export async function verifyTokenEdge(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secret = await getEncryptionKey();
    const { payload } = await jwtDecrypt(token, secret);
    const adminId = payload.adminId as string | undefined;
    const email = payload.email as string | undefined;
    if (!adminId || !email) return null;
    return { adminId, email } as AdminTokenPayload;
  } catch {
    return null;
  }
}
