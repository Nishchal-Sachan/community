import AdminHelpdeskClient from "@/components/admin/AdminHelpdeskClient";

export default function AdminHelpdeskPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Helpdesk
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Community help requests submitted from the public helpdesk form.
      </p>
      <AdminHelpdeskClient />
    </div>
  );
}
