type LeanAuthor =
  | string
  | { _id?: unknown; name?: string; email?: string }
  | null
  | undefined;

function serializeAuthor(author: LeanAuthor): {
  id: string;
  name: string;
  email?: string;
} | null {
  if (author == null) return null;
  if (typeof author === "object") {
    const a = author as { _id?: unknown; name?: string; email?: string };
    const id = a._id != null ? String(a._id) : String(author);
    if (a.name !== undefined || a.email !== undefined) {
      return {
        id,
        name: String(a.name ?? ""),
        ...(a.email ? { email: String(a.email) } : {}),
      };
    }
    return { id, name: "" };
  }
  return { id: String(author), name: "" };
}

export function serializeBlog(
  doc: {
    _id?: unknown;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    author?: LeanAuthor;
    published?: boolean;
    createdAt?: Date | string;
  } | null | undefined,
  opts?: { includeContent?: boolean },
): Record<string, unknown> | null {
  if (!doc) return null;
  const includeContent = opts?.includeContent !== false;
  const createdAt = doc?.createdAt;
  return {
    id: doc?._id != null ? String(doc._id) : "",
    title: doc?.title ?? "",
    slug: doc?.slug ?? "",
    ...(includeContent ? { content: doc?.content ?? "" } : {}),
    excerpt: doc?.excerpt ?? "",
    coverImage: doc?.coverImage ?? "",
    category: doc?.category ?? "",
    tags: Array.isArray(doc?.tags) ? doc.tags : [],
    author: serializeAuthor(doc?.author),
    published: Boolean(doc?.published),
    createdAt:
      createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? ""),
  };
}
