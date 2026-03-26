"use client";

import type { LeadershipCard } from "@/lib/site-content-types";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_AUTO_MS = 4500;

export type LeadershipSliderProps = {
  leaders: LeadershipCard[];
  /** When set, carousel region uses `aria-labelledby` (heading id on the page). */
  ariaLabelledBy?: string;
  /** Used when `ariaLabelledBy` is not set. */
  ariaLabel?: string;
  className?: string;
  autoSlideIntervalMs?: number;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type FaceVariant = "center" | "side" | "single" | "pair";

function CarouselFace({
  card,
  variant,
  imageFailed,
  onImageError,
  reduceMotion,
}: {
  card: LeadershipCard;
  variant: FaceVariant;
  imageFailed: boolean;
  onImageError: () => void;
  reduceMotion: boolean;
}) {
  const isSide = variant === "side";

  const animate =
    reduceMotion || variant === "single" || variant === "pair"
      ? { scale: 1, opacity: 1 }
      : isSide
        ? { scale: 0.9, opacity: 0.82 }
        : { scale: 1.06, opacity: 1 };

  const ringClass =
    variant === "center"
      ? "shadow-[0_20px_45px_-12px_rgba(0,0,0,0.22)] ring-2 ring-[#F57C00]"
      : isSide
        ? "shadow-md ring-1 ring-gray-200/90"
        : "shadow-lg ring-1 ring-gray-200/80";

  return (
    <motion.article
      animate={animate}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white ${ringClass}`}
    >
      <div className="relative aspect-[4/5] w-full min-h-[200px] max-h-[300px] bg-gray-100 sm:max-h-[340px]">
        {imageFailed ? (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 font-heading text-3xl font-bold text-[#F57C00]"
            aria-hidden
          >
            {getInitials(card.name)}
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={card.image}
            alt=""
            className="h-full w-full object-cover object-top"
            onError={onImageError}
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 text-center text-white sm:p-4">
          <h3 className="font-heading text-sm font-bold leading-snug drop-shadow-sm sm:text-base md:text-lg">
            {card.name}
          </h3>
          <p className="mt-0.5 font-body text-xs font-medium text-white/90 sm:text-sm">
            {card.role}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function LeadershipSlider({
  leaders: items,
  ariaLabelledBy,
  ariaLabel = "नेतृत्व स्लाइडर",
  className = "",
  autoSlideIntervalMs = DEFAULT_AUTO_MS,
}: LeadershipSliderProps) {
  const n = items.length;
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const setErr = useCallback((i: number) => {
    setImageErrors((prev) => ({ ...prev, [i]: true }));
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + n) % n);
    },
    [n]
  );

  useEffect(() => {
    if (n < 3 || reduceMotion) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, autoSlideIntervalMs);
    return () => clearInterval(t);
  }, [n, reduceMotion, autoSlideIntervalMs]);

  const slots = useMemo(() => {
    if (n >= 3) {
      const left = (index - 1 + n) % n;
      const right = (index + 1) % n;
      return [
        {
          card: items[left],
          variant: "side" as const,
          reactKey: `L-${left}-${index}`,
          imageIndex: left,
        },
        {
          card: items[index],
          variant: "center" as const,
          reactKey: `C-${index}`,
          imageIndex: index,
        },
        {
          card: items[right],
          variant: "side" as const,
          reactKey: `R-${right}-${index}`,
          imageIndex: right,
        },
      ];
    }
    if (n === 2) {
      return items.map((card, i) => ({
        card,
        variant: "pair" as const,
        reactKey: `P-${i}`,
        imageIndex: i,
      }));
    }
    return [{ card: items[0], variant: "single" as const, reactKey: "S-0", imageIndex: 0 }];
  }, [items, index, n]);

  if (n === 0) {
    return null;
  }

  if (n === 1) {
    const card = items[0];
    return (
      <div className={`mx-auto flex w-full max-w-[320px] justify-center ${className}`.trim()}>
        <CarouselFace
          card={card}
          variant="single"
          imageFailed={!!imageErrors[0]}
          onImageError={() => setErr(0)}
          reduceMotion={reduceMotion}
        />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div
        className={`mx-auto flex w-full max-w-[720px] flex-wrap items-stretch justify-center gap-6 md:gap-10 ${className}`.trim()}
      >
        {items.map((card, i) => (
          <div
            key={`${card.name}-${i}`}
            className="w-full max-w-[280px] sm:w-[calc(50%-1.25rem)] sm:max-w-[300px]"
          >
            <CarouselFace
              card={card}
              variant="pair"
              imageFailed={!!imageErrors[i]}
              onImageError={() => setErr(i)}
              reduceMotion={reduceMotion}
            />
          </div>
        ))}
      </div>
    );
  }

  const regionProps = ariaLabelledBy
    ? ({ "aria-labelledby": ariaLabelledBy } as const)
    : ({ "aria-label": ariaLabel } as const);

  return (
    <div
      className={`relative mx-auto w-full max-w-[960px] px-1 py-2 md:px-2 md:py-4 ${className}`.trim()}
      role="region"
      aria-roledescription="carousel"
      {...regionProps}
    >
      <div className="flex items-center gap-1 md:gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className="inline-flex shrink-0 rounded-full border border-gray-200 bg-white p-1.5 text-gray-700 shadow-sm transition-colors hover:border-[#F57C00] hover:text-[#F57C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] md:p-2"
          aria-label="पिछला नेता"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-3 items-center gap-2 md:gap-4">
          {slots.map((slot) => (
            <div key={slot.reactKey} className="min-w-0">
              <CarouselFace
                card={slot.card}
                variant={slot.variant}
                imageFailed={!!imageErrors[slot.imageIndex]}
                onImageError={() => setErr(slot.imageIndex)}
                reduceMotion={reduceMotion}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="inline-flex shrink-0 rounded-full border border-gray-200 bg-white p-1.5 text-gray-700 shadow-sm transition-colors hover:border-[#F57C00] hover:text-[#F57C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] md:p-2"
          aria-label="अगला नेता"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div
        className="mt-5 flex justify-center gap-2"
        role="tablist"
        aria-label="नेतृत्व स्लाइड"
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`स्लाइड ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2 ${
              i === index ? "w-8 bg-[#F57C00]" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
