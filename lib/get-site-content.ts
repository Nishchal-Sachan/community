import { connectDB } from "@/lib/db";
import SiteContent, { type SiteSectionKey } from "@/lib/models/SiteContent";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";
import type { CtaSlide, LeadershipCard } from "@/lib/site-content-types";

export type { CtaSlide, LeadershipCard } from "@/lib/site-content-types";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown> | undefined
): T {
  if (!patch || typeof patch !== "object") return { ...base };
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch)) {
    const pv = patch[k];
    const bv = out[k];
    if (
      pv &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      bv &&
      typeof bv === "object" &&
      !Array.isArray(bv)
    ) {
      out[k] = deepMerge(bv as Record<string, unknown>, pv as Record<string, unknown>);
    } else if (pv !== undefined) {
      out[k] = pv;
    }
  }
  return out as T;
}

export async function getMergedSiteContent(): Promise<Record<SiteSectionKey, Record<string, unknown>>> {
  await connectDB();
  const docs = await SiteContent.find({}).lean();
  const bySection = new Map<string, Record<string, unknown>>();
  for (const d of docs) {
    bySection.set(d.section, (d.data ?? {}) as Record<string, unknown>);
  }

  const keys: SiteSectionKey[] = [
    "hero",
    "cta",
    "leadership",
    "services",
    "home_images",
    "gallery",
  ];

  const result = {} as Record<SiteSectionKey, Record<string, unknown>>;
  for (const k of keys) {
    const def = SITE_CONTENT_DEFAULTS[k] as Record<string, unknown>;
    const stored = bySection.get(k);
    result[k] = deepMerge(def, stored);
  }
  return result;
}

/** Hero shape for `HeroSection` (title/subtitle/ctaText). */
export function heroForBanner(hero: Record<string, unknown>) {
  return {
    title: String(hero.heading ?? hero.title ?? ""),
    subtitle: String(hero.subheading ?? hero.subtitle ?? ""),
    ctaText: String(hero.buttonText ?? hero.ctaText ?? ""),
    backgroundImage: String(hero.backgroundImage ?? ""),
  };
}

/** Returns normalized slides, or `null` to keep component defaults. */
export function ctaSlidesFromContent(
  cta: Record<string, unknown>
): CtaSlide[] | null {
  const slides = cta.slides;
  if (!Array.isArray(slides) || slides.length === 0) return null;
  const out: CtaSlide[] = [];
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const image = String(o.image ?? "").trim();
    if (!image) continue;
    out.push({
      id: String(o.id ?? `slide-${i}`),
      image,
      heading: String(o.heading ?? ""),
      buttonText: String(o.buttonText ?? "जुड़ें"),
    });
  }
  return out.length > 0 ? out : null;
}

export function leadershipCardsFromContent(
  leadership: Record<string, unknown>
): LeadershipCard[] | null {
  const cards = leadership.cards;
  if (!Array.isArray(cards) || cards.length === 0) return null;
  const out: LeadershipCard[] = [];
  for (const c of cards) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    const image = String(o.image ?? "").trim();
    if (!name || !image) continue;
    out.push({
      name,
      role: String(o.role ?? ""),
      image,
    });
  }
  return out.length > 0 ? out : null;
}

export function servicesFromContent(services: Record<string, unknown>) {
  const raw = services.descriptions;
  const descriptions = Array.isArray(raw)
    ? raw.map((d) => String(d).trim()).filter(Boolean)
    : [];
  return {
    title: String(services.title ?? "").trim(),
    descriptions,
  };
}

export function imageUrlsFromSection(section: Record<string, unknown>): string[] {
  const v = section.images;
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}
