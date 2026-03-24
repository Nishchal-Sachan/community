/**
 * Public gallery (`SiteContent` section `gallery`).
 * Supports albums/categories later via optional `albumId` / `category`.
 */

export type GalleryItem = {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
  albumId?: string;
};

export function newGalleryItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseItem(raw: unknown, index: number): GalleryItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const imageUrl = String(o.imageUrl ?? o.url ?? "").trim();
  if (!imageUrl) return null;
  const title = o.title != null ? String(o.title).trim() : "";
  const category = o.category != null ? String(o.category).trim() : "";
  const albumId = o.albumId != null ? String(o.albumId).trim() : "";
  return {
    id: String(o.id ?? `item-${index}`),
    imageUrl,
    ...(title ? { title } : {}),
    ...(category ? { category } : {}),
    ...(albumId ? { albumId } : {}),
  };
}

/** Merged `content.gallery` → list for UI. Prefers `items`; falls back to legacy `images[]`. */
export function normalizeGalleryItems(
  data: Record<string, unknown> | undefined
): GalleryItem[] {
  if (!data || typeof data !== "object") return [];

  const itemsRaw = data.items;
  if (Array.isArray(itemsRaw) && itemsRaw.length > 0) {
    const out: GalleryItem[] = [];
    for (let i = 0; i < itemsRaw.length; i++) {
      const item = parseItem(itemsRaw[i], i);
      if (item) out.push(item);
    }
    if (out.length > 0) return out;
  }

  const images = data.images;
  if (!Array.isArray(images)) return [];
  const legacy: GalleryItem[] = [];
  for (let i = 0; i < images.length; i++) {
    const imageUrl = String(images[i] ?? "").trim();
    if (!imageUrl) continue;
    legacy.push({ id: `legacy-${i}`, imageUrl });
  }
  return legacy;
}
