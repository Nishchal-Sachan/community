import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import BlogBackButton from "@/app/blog/_components/BlogBackButton";
import Footer from "@/app/_components/Footer";
import { connectDB } from "@/lib/db";
import Blog from "@/lib/models/Blog";

type Props = { params: Promise<{ slug: string }> };

/** Plain text for <meta name="description"> (excerpt may contain HTML). */
function plainForMeta(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const META_DESC_MAX = 160;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw ?? "").trim().toLowerCase();
  if (!slug) return { title: "ब्लॉग" };

  await connectDB();
  const doc = await Blog.findOne({ slug, published: true })
    .select("title excerpt content coverImage")
    .lean();
  if (!doc) return { title: "नहीं मिला" };

  const excerpt = plainForMeta(String(doc.excerpt ?? ""));
  const fromContent = plainForMeta(String(doc.content ?? ""));
  const description =
    (excerpt ? excerpt.slice(0, META_DESC_MAX) : "") ||
    (fromContent ? fromContent.slice(0, META_DESC_MAX) : "") ||
    undefined;

  const cover = String(doc.coverImage ?? "").trim();

  return {
    title: doc.title,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: "article",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: doc.title,
      description,
    },
  };
}

function BlogBody({ content }: { content: string }) {
  const trimmed = content.trim();
  const looksHtml =
    /^[\s]*</.test(trimmed) || /<\/[a-z][\s\S]*>/i.test(trimmed);

  if (looksHtml) {
    const clean = DOMPurify.sanitize(trimmed);
    return (
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  const blocks = trimmed
    ? trimmed.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
    : [];

  return (
    <div className="prose prose-neutral max-w-none">
      {blocks.map((block, i) => (
        <p key={i}>{block}</p>
      ))}
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw ?? "").trim().toLowerCase();
  if (!slug) notFound();

  await connectDB();
  const doc = await Blog.findOne({ slug, published: true })
    .populate("author", "name")
    .lean();

  if (!doc) notFound();

  const title = doc.title;
  const content = String(doc.content ?? "");
  const coverSrc = String(doc.coverImage ?? "").trim() || "/placeholder.jpg";
  const createdAt = doc.createdAt;
  const dateStr =
    createdAt instanceof Date
      ? createdAt.toLocaleDateString("hi-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  const authorName =
    doc.author &&
    typeof doc.author === "object" &&
    "name" in doc.author &&
    doc.author.name
      ? String((doc.author as { name?: string }).name)
      : "";

  const byline = [authorName, dateStr].filter(Boolean).join(" • ");

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs; no remotePatterns */}
        <img
          src={coverSrc}
          alt={title}
          className="w-full rounded-xl mb-6 object-cover max-h-[min(28rem,75vh)]"
        />

        <BlogBackButton />

        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        {byline ? (
          <p className="text-gray-500 mb-6">{byline}</p>
        ) : (
          <div className="mb-6" aria-hidden />
        )}

        <BlogBody content={content} />
      </div>

      <Footer />
    </main>
  );
}
