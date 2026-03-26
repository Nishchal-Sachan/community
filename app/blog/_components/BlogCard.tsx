import Link from "next/link";

export type BlogCardProps = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
};

export default function BlogCard({
  title,
  slug,
  excerpt,
  coverImage,
}: BlogCardProps) {
  const href = `/blog/${encodeURIComponent(slug)}`;
  const coverSrc = coverImage.trim() || "/placeholder.jpg";
  const excerptText =
    excerpt.trim() ||
    "समाज, कार्यक्रमों और समाचार पर विस्तृत जानकारी पढ़ें।";

  return (
    <article className="flex h-full flex-col overflow-hidden bg-white rounded-xl shadow hover:shadow-lg transition">
      <Link href={href} className="block shrink-0 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CMS URLs; no remotePatterns */}
        <img
          src={coverSrc}
          alt=""
          className="h-48 w-full object-cover rounded-t-xl"
        />
      </Link>

      <div className="p-4 flex flex-1 flex-col">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-3 flex-1">
          {excerptText}
        </p>

        <Link
          href={href}
          className="text-orange-500 mt-2 font-medium hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-sm w-fit"
        >
          Read More →
        </Link>
      </div>
    </article>
  );
}
