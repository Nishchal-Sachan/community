import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageContent, { getPageContent, type IInitiative } from "@/lib/models/PageContent";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

const URL_REGEX = /^https?:\/\/.+/;

// ─── Validation helpers ─────────────────────────────────────────────────────

function isValidUrl(s: string): boolean {
  const trimmed = s.trim();
  return trimmed === "" || URL_REGEX.test(trimmed);
}

function validateHero(body: unknown): void {
  if (!body || typeof body !== "object") return;
  const h = body as Record<string, unknown>;
  if (h.title !== undefined) {
    if (typeof h.title !== "string" || !h.title.trim())
      throw new ApiError(400, "hero.title must be a non-empty string");
    if (h.title.trim().length > 200)
      throw new ApiError(400, "hero.title must be at most 200 characters");
  }
  if (h.subtitle !== undefined) {
    if (typeof h.subtitle !== "string" || !h.subtitle.trim())
      throw new ApiError(400, "hero.subtitle must be a non-empty string");
    if (h.subtitle.trim().length > 300)
      throw new ApiError(400, "hero.subtitle must be at most 300 characters");
  }
  if (h.ctaText !== undefined) {
    if (typeof h.ctaText !== "string" || !h.ctaText.trim())
      throw new ApiError(400, "hero.ctaText must be a non-empty string");
    if (h.ctaText.trim().length > 100)
      throw new ApiError(400, "hero.ctaText must be at most 100 characters");
  }
  if (h.backgroundImage !== undefined) {
    if (typeof h.backgroundImage !== "string")
      throw new ApiError(400, "hero.backgroundImage must be a string");
    if (!isValidUrl(h.backgroundImage))
      throw new ApiError(400, "hero.backgroundImage must be a valid URL or empty");
    if (h.backgroundImage.length > 2048)
      throw new ApiError(400, "hero.backgroundImage URL is too long");
  }
}

function validateAbout(body: unknown): void {
  if (!body || typeof body !== "object") return;
  const a = body as Record<string, unknown>;
  if (a.bio !== undefined) {
    if (typeof a.bio !== "string")
      throw new ApiError(400, "about.bio must be a string");
  }
  if (a.leaderImage !== undefined) {
    if (typeof a.leaderImage !== "string")
      throw new ApiError(400, "about.leaderImage must be a string");
    if (!isValidUrl(a.leaderImage))
      throw new ApiError(400, "about.leaderImage must be a valid URL or empty");
    if (a.leaderImage.length > 2048)
      throw new ApiError(400, "about.leaderImage URL is too long");
  }
}

function validateInitiative(item: unknown, index: number): IInitiative {
  if (!item || typeof item !== "object" || Array.isArray(item))
    throw new ApiError(400, `initiatives[${index}] must be an object`);
  const i = item as Record<string, unknown>;
  const title = i.title;
  const description = i.description;
  const icon = i.icon;
  if (typeof title !== "string" || !title.trim())
    throw new ApiError(400, `initiatives[${index}].title must be a non-empty string`);
  if (title.trim().length > 200)
    throw new ApiError(400, `initiatives[${index}].title must be at most 200 characters`);
  if (typeof description !== "string" || !description.trim())
    throw new ApiError(400, `initiatives[${index}].description must be a non-empty string`);
  if (description.trim().length > 500)
    throw new ApiError(400, `initiatives[${index}].description must be at most 500 characters`);
  if (typeof icon !== "string" || !icon.trim())
    throw new ApiError(400, `initiatives[${index}].icon must be a non-empty string`);
  if (icon.trim().length > 50)
    throw new ApiError(400, `initiatives[${index}].icon must be at most 50 characters`);
  return {
    title: (title as string).trim(),
    description: (description as string).trim(),
    icon: (icon as string).trim(),
  };
}

function validateInitiatives(body: unknown): IInitiative[] | undefined {
  if (body === undefined) return undefined;
  if (!Array.isArray(body))
    throw new ApiError(400, "initiatives must be an array");
  if (body.length < 1 || body.length > 12)
    throw new ApiError(400, "initiatives must have 1–12 items");
  return body.map(validateInitiative);
}

// ─── Response shape ──────────────────────────────────────────────────────────

function toResponse(doc: Awaited<ReturnType<typeof getPageContent>>) {
  return {
    content: {
      hero: {
        title: doc.hero.title,
        subtitle: doc.hero.subtitle,
        ctaText: doc.hero.ctaText,
        backgroundImage: doc.hero.backgroundImage,
      },
      about: {
        bio: doc.about.bio,
        leaderImage: doc.about.leaderImage,
      },
      initiatives: doc.initiatives.map((i) => ({
        title: i.title,
        description: i.description,
        icon: i.icon,
      })),
    },
  };
}

// ─── GET /api/content — public ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    void req;
    await connectDB();
    const doc = await getPageContent();
    return NextResponse.json(toResponse(doc));
  } catch (error) {
    return handleApiError(error, "GET /api/content");
  }
}

// ─── PUT /api/content — admin only ──────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    validateHero(body.hero);
    validateAbout(body.about);
    const initiatives = validateInitiatives(body.initiatives);

    await connectDB();

    const doc = await getPageContent();
    const update: Record<string, unknown> = {};

    if (body.hero && typeof body.hero === "object") {
      const h = body.hero as Record<string, unknown>;
      if (h.title !== undefined) update["hero.title"] = (h.title as string).trim();
      if (h.subtitle !== undefined) update["hero.subtitle"] = (h.subtitle as string).trim();
      if (h.ctaText !== undefined) update["hero.ctaText"] = (h.ctaText as string).trim();
      if (h.backgroundImage !== undefined)
        update["hero.backgroundImage"] = (h.backgroundImage as string).trim();
    }
    if (body.about && typeof body.about === "object") {
      const a = body.about as Record<string, unknown>;
      if (a.bio !== undefined) update["about.bio"] = (a.bio as string).trim();
      if (a.leaderImage !== undefined)
        update["about.leaderImage"] = (a.leaderImage as string).trim();
    }
    if (initiatives !== undefined) update.initiatives = initiatives;

    if (Object.keys(update).length === 0)
      throw new ApiError(400, "Provide at least one field to update: hero, about, or initiatives");

    const updated = await PageContent.findOneAndUpdate(
      { _id: doc._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) throw new ApiError(500, "Failed to update page content");

    return NextResponse.json(toResponse(updated));
  } catch (error) {
    return handleApiError(error, "PUT /api/content");
  }
}
