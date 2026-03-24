"use client";

import type { GalleryItem } from "@/lib/gallery-content";
import { useCallback, useEffect, useState } from "react";

type Props = { initialItems: GalleryItem[] };

export default function GalleryPageClient({ initialItems }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, close]);

  const active = openIndex !== null ? initialItems[openIndex] : null;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="border-b border-gray-300 pb-2 text-2xl font-semibold text-gray-900">
            गैलरी
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            पूर्ण आकार में देखने के लिए चित्र पर क्लिक करें।
          </p>
        </header>

        {initialItems.length === 0 ? (
          <p className="mt-12 text-center text-sm text-gray-600">
            कोई चित्र उपलब्ध नहीं हैं
          </p>
        ) : (
          <ul className="mt-6 grid list-none grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {initialItems.map((item, index) => (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2"
                >
                  <div className="h-[200px] w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title ?? ""}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>
                  {item.title ? (
                    <p className="mt-1.5 text-xs leading-snug text-gray-600">
                      {item.title}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="पूर्ण चित्र"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-black/40 text-2xl leading-none text-white hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="बंद करें"
          >
            ×
          </button>
          <div
            className="max-h-[90vh] max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.imageUrl}
              alt={active.title ?? "गैलरी चित्र"}
              decoding="async"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
            {active.title ? (
              <p className="mt-3 text-center text-sm text-white/90">
                {active.title}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
