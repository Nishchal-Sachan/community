import { ApiError, handleApiError } from "@/lib/api-error";
import { serializeBlog } from "@/lib/blog-json";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { NextRequest, NextResponse } from "next/server";

// GET /api/blogs/:slug — single published post
function normalizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}-]/gu, "") // removes | and special chars
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const resolvedParams = await params;
    const raw = resolvedParams.slug;
    const decoded = decodeURIComponent(raw ?? "");
    const slug = normalizeSlug(decoded);
    if (!slug) throw new ApiError(400, "Invalid slug");

    await connectDB();

    const doc = await Blog.findOne({ slug, published: true })
      .populate("author", "name email")
      .lean();

    if (!doc) throw new ApiError(404, "Not found");

    return NextResponse.json({
      blog: serializeBlog(doc as Parameters<typeof serializeBlog>[0], {
        includeContent: true,
      }),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/blogs/:slug");
  }
}
