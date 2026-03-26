import AdminMembersClient from "@/components/admin/AdminMembersClient";

export default function AdminMembersPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Members
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Shows accounts with membership <strong>pending</strong> or <strong>active</strong> only.
        Reject or Delete clears membership; those rows leave this list (the account may still exist).
      </p>
      <AdminMembersClient />
    </div>
  );
}
