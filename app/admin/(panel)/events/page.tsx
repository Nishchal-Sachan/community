import AdminEventsClient from "@/components/admin/AdminEventsClient";

export default function AdminEventsPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Events
      </h2>
      <AdminEventsClient />
    </div>
  );
}
