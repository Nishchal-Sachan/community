import BlogForm from "@/components/admin/BlogForm";

export default function AdminNewBlogPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        New blog post
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Add a title, body, optional cover image, category, and tags. Slug is
        generated from the title.
      </p>
      <BlogForm mode="create" />
    </div>
  );
}
