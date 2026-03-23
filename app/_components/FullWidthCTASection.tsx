"use client";

import { JoinLink } from "@/components/JoinLink";
import { useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    id: "slide-1",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=900&fit=crop&q=80",
    heading: "Transform Your Community, Transform the Nation",
    buttonText: "Join Today",
  },
  {
    id: "slide-2",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=900&fit=crop&q=80",
    heading: "Step Into Change – Join ABKM and Build a Self-Reliant India!",
    buttonText: "Get Started",
  },
  {
    id: "slide-3",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&h=900&fit=crop&q=80",
    heading: "Empowering Every Member for a Stronger Future",
    buttonText: "Join Today",
  },
  {
    id: "slide-4",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=900&fit=crop&q=80",
    heading: "Together We Rise, Together We Lead",
    buttonText: "Join Today",
  },
] as const;

const SLIDE_INTERVAL_MS = 4000;

export default function FullWidthCTASection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="cta-community"
      className="relative h-[500px] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-labelledby="cta-community-heading"
    >
      {SLIDES.map((slide, index) => (
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
              className="mx-auto mb-5 max-w-[900px] font-heading text-[48px] font-bold leading-[1.2] text-white max-md:text-[36px] max-sm:text-[28px]"
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
        className="absolute bottom-[30px] left-1/2 flex -translate-x-1/2 gap-2.5"
        role="tablist"
        aria-label="Slide navigation"
      >
        {SLIDES.map((_, index) => (
          <button
            key={SLIDES[index].id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`Go to slide ${index + 1}`}
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
