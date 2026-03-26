import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { slugFromTitle, ensureUniqueBlogSlug } from "@/lib/blog-slug";
import { serializeBlog } from "@/lib/blog-json";

// GET /api/admin/blogs — all posts (published + drafts), for admin UI
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    await connectDB();
    const docs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate("author", "name email")
      .lean();

    const blogs = docs.map((d) =>
      serializeBlog(d as Parameters<typeof serializeBlog>[0], {
        includeContent: false,
      }),
    );

    return NextResponse.json({ blogs });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/blogs");
  }
}

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .slice(0, 50);
}

// POST /api/admin/blogs — create (slug from title unless `slug` provided)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    if (!title) throw new ApiError(400, "Title is required");
    if (!content) throw new ApiError(400, "Content is required");

    const excerpt = String(body.excerpt ?? "").trim().slice(0, 500);
    const coverImage = String(body.coverImage ?? "").trim().slice(0, 2000);
    const category = String(body.category ?? "").trim().slice(0, 120);
    const tags = parseTags(body.tags);

    let author: mongoose.Types.ObjectId | undefined;
    const authorRaw = body.author;
    if (authorRaw != null && String(authorRaw).trim()) {
      const id = String(authorRaw).trim();
      if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid author id");
      author = new mongoose.Types.ObjectId(id);
    }

    const published =
      typeof body.published === "boolean" ? body.published : true;

    let slugBase: string;
    if (body.slug != null && String(body.slug).trim()) {
      slugBase = String(body.slug).trim().toLowerCase().replace(/\s+/g, "-");
    } else {
      slugBase = slugFromTitle(title);
    }
    if (!slugBase) slugBase = "post";

    await connectDB();
    const slug = await ensureUniqueBlogSlug(slugBase.slice(0, 200));

    const doc = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      ...(author ? { author } : {}),
      published,
    });

    const populated = await Blog.findById(doc._id)
      .populate("author", "name email")
      .lean();

    return NextResponse.json({
      blog: serializeBlog(
        populated as Parameters<typeof serializeBlog>[0],
        { includeContent: true },
      ),
    });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/blogs");
  }
}
