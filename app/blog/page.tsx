import type { Metadata } from "next";
import Footer from "@/app/_components/Footer";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";
import BlogCard from "./_components/BlogCard";

const blogIndexDescription =
  "अखिल भारतीय कुशवाहा महासभा — समाचार, लेख और समाज से जुड़े अपडेट।";

export const metadata: Metadata = {
  title: "ब्लॉग",
  description: blogIndexDescription,
  openGraph: {
    title: "ब्लॉग",
    description: blogIndexDescription,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ब्लॉग",
    description: blogIndexDescription,
  },
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  await connectDB();
  const docs = await Blog.find({ published: true })
    .sort({ createdAt: -1 })
    .select("title slug excerpt coverImage")
    .lean();

  const items = docs.map((d) => ({
    title: d.title,
    slug: d.slug,
    excerpt: String(d.excerpt ?? ""),
    coverImage: String(d.coverImage ?? ""),
  }));

  return (
    <main className="min-h-screen bg-[var(--color-background-light)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 font-heading text-[var(--color-secondary)]">
          ब्लॉग
        </h1>

        {items.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-[var(--color-border-muted)] bg-white px-6 py-16 text-center"
            role="status"
          >
            <p className="font-heading text-lg font-semibold text-[var(--color-secondary)]">
              अभी कोई पोस्ट उपलब्ध नहीं है
            </p>
            <p className="mt-2 font-body text-sm text-[var(--color-subtle)]">
              जल्द ही नए लेख यहाँ दिखाई देंगे।
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
