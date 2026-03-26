import AdminBlogsClient from "@/components/admin/AdminBlogsClient";

export default function AdminBlogsPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Blog posts
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Create, edit, publish, or remove community blog posts. Public site shows
        only published posts.
      </p>
      <AdminBlogsClient />
    </div>
  );
}
