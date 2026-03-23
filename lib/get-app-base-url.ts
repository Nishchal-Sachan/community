/**
 * Resolves the public origin for server-side fetches to this app's `/api/*` routes.
 * Priority: NEXT_PUBLIC_API_URL → NEXT_PUBLIC_APP_URL → NEXT_PUBLIC_BASE_URL → Vercel → request headers.
 */
function normalizeOrigin(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  return raw.replace(/\/+$/, "");
}

export async function getAppBaseUrl(): Promise<string> {
  const fromEnv =
    normalizeOrigin(process.env.NEXT_PUBLIC_API_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_BASE_URL);
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  } catch {
    return "http://localhost:3000";
  }
}
