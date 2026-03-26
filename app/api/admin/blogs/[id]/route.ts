import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { slugFromTitle, ensureUniqueBlogSlug } from "@/lib/blog-slug";
import { serializeBlog } from "@/lib/blog-json";

// GET /api/admin/blogs/:id — full post for edit form
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    await connectDB();
    const doc = await Blog.findById(id)
      .populate("author", "name email")
      .lean();
    if (!doc) throw new ApiError(404, "Not found");

    return NextResponse.json({
      blog: serializeBlog(doc as Parameters<typeof serializeBlog>[0], {
        includeContent: true,
      }),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/blogs/:id");
  }
}

function parseTags(raw: unknown): string[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => String(t ?? "").trim())
    .filter(Boolean)
    .slice(0, 50);
}

// PUT /api/admin/blogs/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    await connectDB();

    const existing = await Blog.findById(id).lean();
    if (!existing) throw new ApiError(404, "Not found");

    const $set: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = String(body.title ?? "").trim();
      if (!title) throw new ApiError(400, "Title cannot be empty");
      $set.title = title;
    }

    if (body.content !== undefined) {
      const content = String(body.content ?? "").trim();
      if (!content) throw new ApiError(400, "Content cannot be empty");
      $set.content = content;
    }

    if (body.excerpt !== undefined) {
      $set.excerpt = String(body.excerpt ?? "").trim().slice(0, 500);
    }
    if (body.coverImage !== undefined) {
      $set.coverImage = String(body.coverImage ?? "").trim().slice(0, 2000);
    }
    if (body.category !== undefined) {
      $set.category = String(body.category ?? "").trim().slice(0, 120);
    }

    const tags = parseTags(body.tags);
    if (tags !== undefined) $set.tags = tags;

    if (body.author !== undefined) {
      const authorRaw = body.author;
      if (authorRaw === null || authorRaw === "") {
        $set.author = null;
      } else {
        const aid = String(authorRaw).trim();
        if (!mongoose.isValidObjectId(aid)) throw new ApiError(400, "Invalid author id");
        $set.author = new mongoose.Types.ObjectId(aid);
      }
    }

    if (body.published !== undefined) {
      if (typeof body.published !== "boolean") {
        throw new ApiError(400, "published must be a boolean");
      }
      $set.published = body.published;
    }

    const explicitSlug = String(body.slug ?? "").trim();
    if (explicitSlug) {
      const slugBase = explicitSlug.toLowerCase().replace(/\s+/g, "-");
      $set.slug = await ensureUniqueBlogSlug(slugBase.slice(0, 200), id);
    } else if ($set.title !== undefined && !explicitSlug) {
      const nextTitle = String($set.title);
      const base = slugFromTitle(nextTitle);
      const root = base || "post";
      $set.slug = await ensureUniqueBlogSlug(root.slice(0, 200), id);
    }

    if (Object.keys($set).length === 0) {
      throw new ApiError(400, "No valid fields to update");
    }

    const doc = await Blog.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true })
      .populate("author", "name email")
      .lean();

    if (!doc) throw new ApiError(404, "Not found");

    return NextResponse.json({
      blog: serializeBlog(doc as Parameters<typeof serializeBlog>[0], {
        includeContent: true,
      }),
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/admin/blogs/:id");
  }
}

// DELETE /api/admin/blogs/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    await connectDB();
    const result = await Blog.findByIdAndDelete(id);
    if (!result) throw new ApiError(404, "Not found");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/admin/blogs/:id");
  }
}
