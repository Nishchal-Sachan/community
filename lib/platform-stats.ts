import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";
import Job from "@/lib/models/Job";
import SiteContent from "@/lib/models/SiteContent";
import User from "@/lib/models/User";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

export type PlatformStatsResponse = {
  members: number;
  jobs: number;
  jobSeekers: number;
  events: number;
  educationSupport: number;
};

const EMPTY: PlatformStatsResponse = {
  members: 0,
  jobs: 0,
  jobSeekers: 0,
  events: 0,
  educationSupport: 0,
};

function defaultEducationSupport(): number {
  const v = (SITE_CONTENT_DEFAULTS.impact as { educationSupport?: unknown }).educationSupport;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function parseNonNegativeInt(raw: unknown, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback >= 0 ? Math.floor(fallback) : 0;
  return Math.floor(n);
}

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try {
    const n = await fn();
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function safeImpactDoc() {
  try {
    return await SiteContent.findOne({ section: "impact" }).lean();
  } catch {
    return null;
  }
}

/**
 * Aggregates counts for the Impact (हमारा प्रभाव) section.
 * - `members`: users with `membershipStatus: "active"`
 * - `jobs`: job listings (`type: "job"`)
 * - `jobSeekers`: Job documents with `type: "profile"` (seeker profiles)
 * - `events`: all Event documents
 * - `educationSupport`: SiteContent `section: "impact"` → `data.educationSupport`, else default from SITE_CONTENT_DEFAULTS
 */
export async function getPlatformStats(): Promise<PlatformStatsResponse> {
  const eduFallback = defaultEducationSupport();

  try {
    await connectDB();
  } catch {
    return { ...EMPTY, educationSupport: eduFallback };
  }

  const [members, jobPostings, jobSeekers, events, impactDoc] = await Promise.all([
    safeCount(() => User.countDocuments({ membershipStatus: "active" })),
    safeCount(() => Job.countDocuments({ type: "job" })),
    safeCount(() => Job.countDocuments({ type: "profile" })),
    safeCount(() => Event.countDocuments({})),
    safeImpactDoc(),
  ]);

  const data = impactDoc?.data as { educationSupport?: unknown } | undefined;
  const educationSupport = parseNonNegativeInt(data?.educationSupport, eduFallback);

  return {
    members,
    jobs: jobPostings,
    jobSeekers,
    events,
    educationSupport,
  };
}
