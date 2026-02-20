import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/lib/models/SiteSettings";
import LogoutButton from "@/app/_components/admin/LogoutButton";
import HeroSettingsForm from "@/app/_components/admin/HeroSettingsForm";
import AdminEventList from "@/app/_components/admin/AdminEventList";

export default async function AdminDashboardPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">{admin.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        {/* ── Site Settings ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Site Settings</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Update the hero title and background image shown on the homepage.
          </p>
          <div className="mt-6">
            <HeroSettingsForm
              initialTitle={settings.heroTitle}
              initialImage={settings.heroImage}
            />
          </div>
        </section>

        {/* ── Events ── */}
        <AdminEventList />
      </div>
    </main>
  );
}
