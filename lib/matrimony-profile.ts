/** Keep in sync with `Matrimony` schema `profilePhotoUrl` maxlength (no mongoose import here — safe for client bundles). */
const MATRIMONY_PHOTO_URL_MAX_LEN = 2048;

/** Up to 4 gallery image URLs; `profilePhotoUrl` is legacy primary. */
export const MATRIMONY_MAX_GALLERY = 4;

export function normalizeMatrimonyGalleryInput(b: Record<string, unknown>): string[] {
  const raw = b.galleryUrls ?? b.photos;
  let urls: string[] = [];
  if (Array.isArray(raw)) {
    urls = raw
      .map((x) => String(x ?? "").trim().slice(0, MATRIMONY_PHOTO_URL_MAX_LEN))
      .filter(Boolean)
      .slice(0, MATRIMONY_MAX_GALLERY);
  }
  const legacy = String(b.profilePhotoUrl ?? "")
    .trim()
    .slice(0, MATRIMONY_PHOTO_URL_MAX_LEN);
  if (legacy && !urls.includes(legacy)) {
    urls = [legacy, ...urls].slice(0, MATRIMONY_MAX_GALLERY);
  }
  return urls;
}

export function matrimonyGalleryUrls(p: {
  profilePhotoUrl?: string;
  galleryUrls?: string[] | null;
}): string[] {
  const raw = Array.isArray(p.galleryUrls) ? p.galleryUrls : [];
  const urls = raw
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, MATRIMONY_MAX_GALLERY);
  if (urls.length > 0) return urls;
  const legacy = (p.profilePhotoUrl ?? "").trim();
  return legacy ? [legacy] : [];
}

export function matrimonyPrimaryImage(p: {
  profilePhotoUrl?: string;
  galleryUrls?: string[] | null;
}): string {
  const g = matrimonyGalleryUrls(p);
  return g[0] ?? "";
}
