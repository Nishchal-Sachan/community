"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";

const PLACEHOLDER_SRC = "/placeholder.jpg";

type MatrimonyProfileHeroCarouselProps = {
  images: string[];
};

function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.src.includes(PLACEHOLDER_SRC)) return;
  el.src = PLACEHOLDER_SRC;
}

export function MatrimonyProfileHeroCarousel({ images }: MatrimonyProfileHeroCarouselProps) {
  const urls = useMemo(
    () => [...new Set((images ?? []).filter((u): u is string => typeof u === "string" && Boolean(u.trim())))],
    [images]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urls.length === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev, urls.length - 1));
  }, [urls]);

  useEffect(() => {
    if (urls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urls.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [urls]);

  if (urls.length === 0) return null;

  const src = urls[currentIndex] ?? urls[0]!;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-gray-900/5">
      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-gray-100">
        {/* Decorative blur — object-contain + scale so edges stay soft without stretching */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden
          onError={handleImgError}
          className="pointer-events-none absolute inset-0 m-auto h-full w-full scale-125 object-contain opacity-40 blur-xl"
        />
        {/* Main — max dimensions only; object-contain preserves aspect ratio for portrait & landscape */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onError={handleImgError}
            className="max-h-full max-w-full object-contain transition duration-500"
          />
        </div>
      </div>

      {urls.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00]"
            aria-label="Previous image"
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1))
            }
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00]"
            aria-label="Next image"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % urls.length)}
          >
            ›
          </button>
        </>
      ) : null}

      <div className="absolute bottom-3 right-3 z-20 rounded bg-black/60 px-2 py-1 text-sm text-white">
        {currentIndex + 1} / {urls.length}
      </div>
    </div>
  );
}
