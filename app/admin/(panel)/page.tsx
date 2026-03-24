import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Dashboard
      </h2>
      <AdminDashboardClient />
    </div>
  );
}
