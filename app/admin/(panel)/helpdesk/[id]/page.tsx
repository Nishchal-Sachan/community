import AdminHelpdeskDetailClient from "@/components/admin/AdminHelpdeskDetailClient";

export default async function AdminHelpdeskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h2 className="mb-4 border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
        Help request
      </h2>
      <AdminHelpdeskDetailClient id={id} />
    </div>
  );
}
