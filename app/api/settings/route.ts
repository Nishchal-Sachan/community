import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSiteSettings, updateSiteSettings } from "@/lib/models/SiteSettings";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

const URL_REGEX = /^https?:\/\/.+/;

// GET /api/settings — public
export async function GET(req: NextRequest) {
  try {
    void req;
    await connectDB();
    const settings = await getSiteSettings();

    return NextResponse.json({
      settings: {
        heroTitle: settings.heroTitle,
        heroImage: settings.heroImage,
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/settings");
  }
}

// PUT /api/settings — admin only
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const { heroTitle, heroImage } = body;

    if (heroTitle === undefined && heroImage === undefined) {
      throw new ApiError(400, "Provide at least one field: heroTitle or heroImage");
    }

    // ── Validate heroTitle ─────────────────────────────────────────────────
    if (heroTitle !== undefined) {
      if (typeof heroTitle !== "string" || !heroTitle.trim()) {
        throw new ApiError(400, "heroTitle must be a non-empty string");
      }
      if (heroTitle.trim().length > 200) {
        throw new ApiError(400, "heroTitle must be at most 200 characters");
      }
    }

    // ── Validate heroImage (empty string = clear it) ───────────────────────
    if (heroImage !== undefined) {
      if (typeof heroImage !== "string") {
        throw new ApiError(400, "heroImage must be a string");
      }
      const trimmed = heroImage.trim();
      if (trimmed !== "" && !URL_REGEX.test(trimmed)) {
        throw new ApiError(400, "heroImage must be a valid HTTP/HTTPS URL or empty string");
      }
      if (trimmed.length > 2048) {
        throw new ApiError(400, "heroImage URL is too long");
      }
    }

    await connectDB();

    const patch: Partial<{ heroTitle: string; heroImage: string }> = {};
    if (heroTitle !== undefined) patch.heroTitle = (heroTitle as string).trim();
    if (heroImage !== undefined) patch.heroImage = (heroImage as string).trim();

    const updated = await updateSiteSettings(patch);

    return NextResponse.json({
      settings: {
        heroTitle: updated.heroTitle,
        heroImage: updated.heroImage,
      },
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/settings");
  }
}
