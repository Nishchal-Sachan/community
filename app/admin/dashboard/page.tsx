import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/lib/models/SiteSettings";
import { getPageContent } from "@/lib/models/PageContent";
import { FALLBACK_CONTENT } from "@/lib/content-fetch";
import LogoutButton from "@/app/_components/admin/LogoutButton";
import HeroSettingsForm from "@/app/_components/admin/HeroSettingsForm";
import ContentManagementForm from "@/app/_components/admin/ContentManagementForm";
import AdminEventList from "@/app/_components/admin/AdminEventList";
import AdminMemberList from "@/app/_components/admin/AdminMemberList";

export default async function AdminDashboardPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  await connectDB();
  const settings = await getSiteSettings();

  let pageContent = FALLBACK_CONTENT;
  try {
    const doc = await getPageContent();
    pageContent = {
      hero: {
        title: doc.hero.title,
        subtitle: doc.hero.subtitle,
        ctaText: doc.hero.ctaText,
        backgroundImage: doc.hero.backgroundImage,
      },
      about: {
        bio: doc.about.bio,
        leaderImage: doc.about.leaderImage,
      },
      initiatives: doc.initiatives.map((i) => ({
        title: i.title,
        description: i.description,
        icon: i.icon,
      })),
    };
  } catch {
    // use FALLBACK_CONTENT
  }

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

        {/* ── Content Management ── */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Edit hero, about, and initiatives shown on the homepage.
          </p>
          <div className="mt-6">
            <ContentManagementForm initialContent={pageContent} />
          </div>
        </section>

        {/* ── Events ── */}
        <AdminEventList />

        {/* ── Members ── */}
        <AdminMemberList />
      </div>
    </main>
  );
}
