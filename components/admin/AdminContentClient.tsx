"use client";

import {
  newGalleryItemId,
  normalizeGalleryItems,
  type GalleryItem,
} from "@/lib/gallery-content";
import { useCallback, useEffect, useState } from "react";

type Slide = { id: string; image: string; heading: string; buttonText: string };
type Card = { name: string; role: string; image: string };

type GalleryFormItem = {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  albumId: string;
};

function galleryItemToForm(item: GalleryItem): GalleryFormItem {
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.title ?? "",
    category: item.category ?? "",
    albumId: item.albumId ?? "",
  };
}

function galleryFormToPayload(items: GalleryFormItem[]): Record<string, unknown>[] {
  return items
    .filter((r) => r.imageUrl.trim())
    .map((r) => {
      const o: Record<string, unknown> = {
        id: r.id,
        imageUrl: r.imageUrl.trim(),
      };
      if (r.title.trim()) o.title = r.title.trim();
      if (r.category.trim()) o.category = r.category.trim();
      if (r.albumId.trim()) o.albumId = r.albumId.trim();
      return o;
    });
}

export default function AdminContentClient() {
  const [msg, setMsg] = useState<string | null>(null);
  const [hero, setHero] = useState({
    heading: "",
    subheading: "",
    buttonText: "",
    backgroundImage: "",
  });
  const [slides, setSlides] = useState<Slide[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [homeImagesText, setHomeImagesText] = useState("");
  const [galleryItems, setGalleryItems] = useState<GalleryFormItem[]>([]);
  const [impactEducationSupport, setImpactEducationSupport] = useState("0");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-content");
      const j = await res.json();
      const c = j.content ?? {};
      const h = c.hero as Record<string, string>;
      setHero({
        heading: String(h.heading ?? ""),
        subheading: String(h.subheading ?? ""),
        buttonText: String(h.buttonText ?? ""),
        backgroundImage: String(h.backgroundImage ?? ""),
      });
      const cta = c.cta as { slides?: Slide[] };
      setSlides(Array.isArray(cta?.slides) && cta.slides.length ? cta.slides : []);
      const lead = c.leadership as { cards?: Card[] };
      setCards(Array.isArray(lead?.cards) && lead.cards.length ? lead.cards : []);
      const hi = c.home_images as { images?: string[] };
      setHomeImagesText(Array.isArray(hi?.images) ? hi.images.join("\n") : "");
      const gal = c.gallery as Record<string, unknown> | undefined;
      setGalleryItems(
        normalizeGalleryItems(gal).map(galleryItemToForm)
      );
      const imp = c.impact as { educationSupport?: number } | undefined;
      setImpactEducationSupport(
        imp?.educationSupport !== undefined && imp?.educationSupport !== null
          ? String(imp.educationSupport)
          : "0"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(section: string, data: Record<string, unknown>) {
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ section, data }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      setMsg(`Saved: ${section}`);
      if (j.content) {
        const c = j.content;
        const h = c.hero as Record<string, string>;
        setHero({
          heading: String(h.heading ?? ""),
          subheading: String(h.subheading ?? ""),
          buttonText: String(h.buttonText ?? ""),
          backgroundImage: String(h.backgroundImage ?? ""),
        });
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  }

  const box = "mb-6 border border-gray-300 bg-white p-4";
  const label = "block text-xs text-gray-600";
  const input = "mt-0.5 w-full border border-gray-300 px-2 py-1.5 text-sm";

  if (loading) return <p className="text-sm text-gray-600">Loading content…</p>;

  return (
    <div className="space-y-2">
      {msg && (
        <p className="text-sm text-gray-800" role="status">
          {msg}
        </p>
      )}

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">A) Hero banner</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Heading</label>
            <input
              className={input}
              value={hero.heading}
              onChange={(e) => setHero((h) => ({ ...h, heading: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Subheading</label>
            <textarea
              className={input}
              rows={2}
              value={hero.subheading}
              onChange={(e) => setHero((h) => ({ ...h, subheading: e.target.value }))}
            />
          </div>
          <div>
            <label className={label}>Button text</label>
            <input
              className={input}
              value={hero.buttonText}
              onChange={(e) => setHero((h) => ({ ...h, buttonText: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Background image URL</label>
            <input
              className={input}
              value={hero.backgroundImage}
              onChange={(e) => setHero((h) => ({ ...h, backgroundImage: e.target.value }))}
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const fd = new FormData();
                  fd.append("file", f);
                  const res = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: fd,
                    credentials: "include",
                  });
                  const j = await res.json();
                  if (!res.ok) throw new Error(j.error ?? "Upload failed");
                  setHero((h) => ({ ...h, backgroundImage: j.url }));
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Upload failed");
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className="mt-3 border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() => void save("hero", { ...hero })}
        >
          Save hero
        </button>
      </section>

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">B) CTA slides</h3>
        {slides.map((s, i) => (
          <div key={s.id} className="mb-3 border border-gray-200 p-2">
            <p className="text-xs text-gray-500">Slide {i + 1}</p>
            <input
              className={input}
              placeholder="Image URL"
              value={s.image}
              onChange={(e) => {
                const next = [...slides];
                next[i] = { ...next[i], image: e.target.value };
                setSlides(next);
              }}
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const fd = new FormData();
                  fd.append("file", f);
                  const res = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: fd,
                    credentials: "include",
                  });
                  const j = await res.json();
                  if (!res.ok) throw new Error(j.error);
                  const next = [...slides];
                  next[i] = { ...next[i], image: j.url };
                  setSlides(next);
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Upload failed");
                }
                e.target.value = "";
              }}
            />
            <input
              className={input}
              placeholder="Heading"
              value={s.heading}
              onChange={(e) => {
                const next = [...slides];
                next[i] = { ...next[i], heading: e.target.value };
                setSlides(next);
              }}
            />
            <input
              className={input}
              placeholder="Button text"
              value={s.buttonText}
              onChange={(e) => {
                const next = [...slides];
                next[i] = { ...next[i], buttonText: e.target.value };
                setSlides(next);
              }}
            />
            <button
              type="button"
              className="mt-1 text-xs text-red-800"
              onClick={() => setSlides(slides.filter((_, j) => j !== i))}
            >
              Remove slide
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mb-2 border border-gray-300 px-2 py-1 text-sm"
          onClick={() =>
            setSlides([
              ...slides,
              {
                id: `slide-${Date.now()}`,
                image: "",
                heading: "",
                buttonText: "जुड़ें",
              },
            ])
          }
        >
          Add slide
        </button>
        <button
          type="button"
          className="border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() => void save("cta", { slides })}
        >
          Save CTA
        </button>
      </section>

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">
          C) Leadership cards
        </h3>
        {cards.map((c, i) => (
          <div key={i} className="mb-2 grid gap-1 border border-gray-200 p-2 sm:grid-cols-3">
            <input
              className={input}
              placeholder="Name"
              value={c.name}
              onChange={(e) => {
                const n = [...cards];
                n[i] = { ...n[i], name: e.target.value };
                setCards(n);
              }}
            />
            <input
              className={input}
              placeholder="Role"
              value={c.role}
              onChange={(e) => {
                const n = [...cards];
                n[i] = { ...n[i], role: e.target.value };
                setCards(n);
              }}
            />
            <input
              className={input}
              placeholder="Image URL"
              value={c.image}
              onChange={(e) => {
                const n = [...cards];
                n[i] = { ...n[i], image: e.target.value };
                setCards(n);
              }}
            />
            <button
              type="button"
              className="text-xs text-red-800 sm:col-span-3"
              onClick={() => setCards(cards.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mb-2 border border-gray-300 px-2 py-1 text-sm"
          onClick={() => setCards([...cards, { name: "", role: "", image: "" }])}
        >
          Add card
        </button>
        <button
          type="button"
          className="border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() => void save("leadership", { cards })}
        >
          Save leadership
        </button>
      </section>

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">
          D) Homepage images (URLs, one per line)
        </h3>
        <textarea
          className={input}
          rows={5}
          value={homeImagesText}
          onChange={(e) => setHomeImagesText(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() =>
            void save("home_images", {
              images: homeImagesText
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
        >
          Save homepage images
        </button>
      </section>

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">
          E) Gallery (चित्र — भविष्य में श्रेणी / एल्बम)
        </h3>
        <p className="mb-3 text-xs text-gray-600">
          प्रत्येक पंक्ति: चित्र URL (अपलोड या पेस्ट), वैकल्पिक शीर्षक, वैकल्पिक श्रेणी व एल्बम
          ID (बाद में उपयोग हेतु)।
        </p>
        {galleryItems.map((row, i) => (
          <div
            key={row.id}
            className="mb-3 grid gap-2 border border-gray-200 p-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 border border-gray-300 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
                  कोई चित्र नहीं
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <label className={label}>Image URL</label>
                <input
                  className={input}
                  value={row.imageUrl}
                  onChange={(e) => {
                    const next = [...galleryItems];
                    next[i] = { ...next[i], imageUrl: e.target.value };
                    setGalleryItems(next);
                  }}
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="text-xs"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const fd = new FormData();
                      fd.append("file", f);
                      const res = await fetch("/api/admin/upload", {
                        method: "POST",
                        body: fd,
                        credentials: "include",
                      });
                      const j = await res.json();
                      if (!res.ok) throw new Error(j.error ?? "Upload failed");
                      const next = [...galleryItems];
                      next[i] = { ...next[i], imageUrl: j.url };
                      setGalleryItems(next);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    }
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div>
              <label className={label}>Title (optional)</label>
              <input
                className={input}
                value={row.title}
                onChange={(e) => {
                  const next = [...galleryItems];
                  next[i] = { ...next[i], title: e.target.value };
                  setGalleryItems(next);
                }}
              />
            </div>
            <div>
              <label className={label}>Category (optional)</label>
              <input
                className={input}
                placeholder="भविष्य: श्रेणी फ़िल्टर"
                value={row.category}
                onChange={(e) => {
                  const next = [...galleryItems];
                  next[i] = { ...next[i], category: e.target.value };
                  setGalleryItems(next);
                }}
              />
            </div>
            <div>
              <label className={label}>Album ID (optional)</label>
              <input
                className={input}
                placeholder="भविष्य: एकाधिक एल्बम"
                value={row.albumId}
                onChange={(e) => {
                  const next = [...galleryItems];
                  next[i] = { ...next[i], albumId: e.target.value };
                  setGalleryItems(next);
                }}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="button"
                className="text-xs text-red-800"
                onClick={() =>
                  setGalleryItems(galleryItems.filter((_, j) => j !== i))
                }
              >
                Remove row
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="mb-2 border border-gray-300 px-2 py-1 text-sm"
          onClick={() =>
            setGalleryItems([
              ...galleryItems,
              {
                id: newGalleryItemId(),
                imageUrl: "",
                title: "",
                category: "",
                albumId: "",
              },
            ])
          }
        >
          Add gallery image
        </button>
        <button
          type="button"
          className="border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() =>
            void save("gallery", { items: galleryFormToPayload(galleryItems) })
          }
        >
          Save gallery
        </button>
      </section>

      <section className={box}>
        <h3 className="mb-3 border-b border-gray-200 pb-1 text-sm font-semibold">
          F) प्रभाव — शिक्षा सहायता
        </h3>
        <p className="mb-2 text-xs text-gray-600">
          यह संख्या &quot;हमारा प्रभाव&quot; में दिखती है। सार्वजनिक API:{" "}
          <code className="rounded bg-gray-100 px-1">GET /api/stats</code> →{" "}
          <code className="rounded bg-gray-100 px-1">educationSupport</code>
        </p>
        <label className={label}>शिक्षा सहायता संख्या</label>
        <input
          type="number"
          min={0}
          className={input}
          value={impactEducationSupport}
          onChange={(e) => setImpactEducationSupport(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 border border-gray-400 bg-gray-100 px-3 py-1 text-sm"
          onClick={() =>
            void save("impact", {
              educationSupport: Math.max(0, Math.floor(Number(impactEducationSupport)) || 0),
            })
          }
        >
          सहेजें
        </button>
      </section>
    </div>
  );
}
