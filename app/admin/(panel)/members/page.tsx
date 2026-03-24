import AdminMembersClient from "@/components/admin/AdminMembersClient";

export default function AdminMembersPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Members
      </h2>
      <AdminMembersClient />
    </div>
  );
}
