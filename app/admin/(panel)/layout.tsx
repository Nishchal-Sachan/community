import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-[#f0f0f0] text-gray-900">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={admin.email} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
