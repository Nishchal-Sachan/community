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

    console.log("RAW:", raw);
    console.log("DECODED:", decoded);
    console.log("FINAL SLUG:", slug);

    if (!slug) throw new ApiError(400, "Invalid slug");

    await connectDB();

    let doc = await Blog.findOne({ slug, published: true })
      .populate("author", "name email")
      .lean();

    // Optional safe fallback: If old slugs exist and a migration happened
    if (!doc) {
      doc = await Blog.findOne({ oldSlug: slug, published: true })
        .populate("author", "name email")
        .lean();
    }

    // Optional safe fallback: If not found by slug, try by ID if it's a valid ObjectId
    if (!doc && /^[0-9a-fA-F]{24}$/.test(slug)) {
      doc = await Blog.findById(slug)
        .populate("author", "name email")
        .lean();
    }

    console.log("DOC:", doc);

    if (!doc) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      blog: serializeBlog(doc as Parameters<typeof serializeBlog>[0], {
        includeContent: true,
      }),
    });
  } catch (error: any) {
    console.error("BLOG FETCH ERROR:", error);
    return NextResponse.json(
      { error: String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
