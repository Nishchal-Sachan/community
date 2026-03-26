import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import { handleApiError } from "@/lib/api-error";
import { serializeBlog } from "@/lib/blog-json";

// GET /api/blogs — published posts only (no full body on list)
export async function GET() {
  try {
    await connectDB();

    const docs = await Blog.find({ published: true })
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
    return handleApiError(error, "GET /api/blogs");
  }
}
