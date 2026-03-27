import Blog from "@/lib/models/Blog";
import slugify from "slugify";
import { transliterate } from "transliteration";

/** Generate safe ascii slug using slugify and transliterate fallback */
export function slugFromTitle(title: string): string {
  // 1. Convert unicode/Hindi into approximate Latin ASCII characters
  const asciiTitle = transliterate(title);

  // 2. Slugify it enforcing strict ASCII lowercase rules
  const cleaned = slugify(asciiTitle, {
    replacement: "-",     // replace spaces with replacement character
    remove: /[^a-zA-Z0-9\s-]/g, // remove characters that match regex
    lower: true,          // convert to lower case
    strict: true,         // strip special characters except replacement
    trim: true,           // trim leading and trailing replacement chars
  });

  // 3. Ensure fallback if totally empty
  if (!cleaned) {
    return "post-" + Date.now();
  }

  return cleaned;
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
