import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory store. Resets on server restart.
 * For multi-instance / serverless deployments replace with a Redis-backed store.
 */
const store = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until the window resets (0 if allowed)
}

/**
 * Sliding-window rate limiter.
 * @param key      Unique key per client+action (e.g. `login:1.2.3.4`)
 * @param limit    Max requests allowed within the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  // No record or window has already expired → start fresh
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  // Window still active and limit exceeded
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Window still active, increment
  record.count += 1;
  return { allowed: true, remaining: limit - record.count, retryAfter: 0 };
}

/**
 * Extracts the most reliable client IP from the request headers.
 * Falls back to "unknown" when running locally without a proxy.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const LOGIN_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
} as const;
