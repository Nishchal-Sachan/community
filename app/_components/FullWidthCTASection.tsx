"use client";

import { JoinLink } from "@/components/JoinLink";
import type { CtaSlide } from "@/lib/site-content-types";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_SLIDES: readonly CtaSlide[] = [
  {
    id: "slide-1",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=900&fit=crop&q=80",
    heading: "अपने समुदाय को बदलें, देश को बदलें",
    buttonText: "आज ही जुड़ें",
  },
  {
    id: "slide-2",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=900&fit=crop&q=80",
    heading: "बदलाव की ओर कदम बढ़ाएं — ABKM से जुड़कर आत्मनिर्भर भारत का निर्माण करें",
    buttonText: "शुरू करें",
  },
  {
    id: "slide-3",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&h=900&fit=crop&q=80",
    heading: "प्रत्येक सदस्य को सशक्त बनाकर एक मजबूत भविष्य की ओर",
    buttonText: "आज ही जुड़ें",
  },
  {
    id: "slide-4",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=900&fit=crop&q=80",
    heading: "एक साथ उठें, एक साथ आगे बढ़ें",
    buttonText: "भागीदार बनें",
  },
] as const;

const SLIDE_INTERVAL_MS = 4000;

type Props = { slides?: CtaSlide[] | null };

function CTACarousel({ slides }: { slides: readonly CtaSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides]);

  return (
    <section
      id="cta-community"
      className="relative h-125 w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-labelledby="cta-community-heading"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-hidden={activeIndex !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            activeIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: 0 }}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            style={{ zIndex: 1 }}
            aria-hidden
          />

          {/* Content container */}
          <div
            className="relative flex h-full flex-col items-center justify-center px-5 text-center"
            style={{ zIndex: 2 }}
          >
            <h2
              id={index === 0 ? "cta-community-heading" : undefined}
              className="mx-auto mb-5 max-w-225 font-heading text-[48px] font-bold leading-[1.2] text-white max-md:text-[36px] max-sm:text-[28px]"
            >
              {slide.heading}
            </h2>
            <JoinLink
              className="rounded-md bg-[#F57C00] px-7 py-3 font-body text-[16px] font-medium text-white transition-colors hover:bg-[#E65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            >
              {slide.buttonText}
            </JoinLink>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div
        className="absolute bottom-7.5 left-1/2 flex -translate-x-1/2 gap-2.5"
        role="tablist"
        aria-label="स्लाइड नेविगेशन"
      >
        {slides.map((s, index) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`स्लाइड ${index + 1} पर जाएं`}
            onClick={() => goToSlide(index)}
            className={`h-2.5 w-2.5 shrink-0 rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 ${
              activeIndex === index
                ? "bg-[#F57C00] opacity-100"
                : "cursor-pointer bg-white opacity-50 hover:opacity-70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function FullWidthCTASection({ slides: slidesProp }: Props) {
  const slides = useMemo((): readonly CtaSlide[] => {
    if (slidesProp && slidesProp.length > 0) return slidesProp;
    return DEFAULT_SLIDES;
  }, [slidesProp]);

  const deckKey = useMemo(() => slides.map((s) => s.id).join("|"), [slides]);

  return <CTACarousel key={deckKey} slides={slides} />;
}
