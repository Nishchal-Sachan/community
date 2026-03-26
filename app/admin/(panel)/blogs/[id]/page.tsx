import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import BlogForm from "@/components/admin/BlogForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditBlogPage({ params }: Props) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const doc = await Blog.findById(id).lean();
  if (!doc) notFound();

  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Edit blog post
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Update content and metadata. Changing the title may update the URL slug.
      </p>
      <BlogForm
        mode="edit"
        blogId={id}
        initial={{
          title: doc.title,
          slug: doc.slug,
          content: String(doc.content ?? ""),
          coverImage: String(doc.coverImage ?? ""),
          category: String(doc.category ?? ""),
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          published: Boolean(doc.published),
        }}
      />
    </div>
  );
}
