import AdminContentClient from "@/components/admin/AdminContentClient";

export default function AdminContentPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Content management
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Edit public website sections. Changes apply after save; refresh the homepage to verify.
      </p>
      <AdminContentClient />
    </div>
  );
}
