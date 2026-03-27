import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { ensureUniqueBlogSlug, slugFromTitle } from "@/lib/blog-slug";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import User from "@/lib/models/User";
import { getUserFromCookie } from "@/lib/user-auth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    if (!payload?.userId) throw new ApiError(401, "Unauthorized");

    await connectDB();
    const user = await User.findById(payload.userId).lean();
    if (!user || user.role !== "member" || !user.isBlogger) {
      throw new ApiError(
        403,
        "आपको ब्लॉग लिखने की अनुमति नहीं है (You are not authorized to create blogs)",
      );
    }

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    if (!title) throw new ApiError(400, "Title is required");
    if (!content) throw new ApiError(400, "Content is required");

    const excerpt = String(body.excerpt ?? "")
      .trim()
      .slice(0, 500);
    const coverImage = String(body.coverImage ?? "")
      .trim()
      .slice(0, 2000);
    const category = String(body.category ?? "")
      .trim()
      .slice(0, 120);
    const tags = parseTags(body.tags);

    // Extract published status from form checkbox (defaults to false if not provided)
    const published = body.published === true;

    let slugBase = slugFromTitle(title);
    if (!slugBase) slugBase = "post";

    const slug = await ensureUniqueBlogSlug(slugBase.slice(0, 200));

    // Blog Ownership: saved with author
    const author = new mongoose.Types.ObjectId(payload.userId);

    const doc = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      author,
      published,
    });

    return NextResponse.json({ ok: true, blogId: doc._id });
  } catch (error) {
    return handleApiError(error, "POST /api/members/blogs");
  }
}
