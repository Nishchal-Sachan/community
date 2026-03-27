import Blog from "@/lib/models/Blog";

/** `title.toLowerCase().replace(/\s+/g, "-")` per product spec. */
export function slugFromTitle(title: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .normalize("NFKD") // 🔥 important for unicode stability
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "") // keep spaces SAFE
    .replace(/\s+/g, "-") // convert spaces → dash
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "post";
}

/** Ensures a unique slug in Blog (appends `-1`, `-2`, … if needed). Max length respects schema. */
export async function ensureUniqueBlogSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const MAX = 200;
  const root = base.trim().slice(0, MAX) || "post";
  let n = 0;

  let attempts = 0;

  while (attempts < 50) {
    const suffix = n === 0 ? "" : `-${n}`;
    const slug = (root.slice(0, MAX - suffix.length) + suffix).slice(0, MAX);

    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Blog.findOne(query).select("_id").lean();
    if (!existing) return slug;

    n++;
    attempts++;
  }

  throw new Error("Failed to generate unique slug");
}
