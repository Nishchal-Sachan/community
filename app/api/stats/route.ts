import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/platform-stats";

/**
 * GET /api/stats — public platform counts for Impact (हमारा प्रभाव) UI.
 * `jobs` = job postings count (see `getPlatformStats`).
 * Missing or failed queries surface as 0; response is always 200 with a full object.
 */
export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({
      members: 0,
      jobs: 0,
      jobSeekers: 0,
      events: 0,
      educationSupport: 0,
    });
  }
}
