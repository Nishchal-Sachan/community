import AdminPaymentsClient from "@/components/admin/AdminPaymentsClient";

export default function AdminPaymentsPage() {
  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Payments
      </h2>
      <AdminPaymentsClient />
    </div>
  );
}
