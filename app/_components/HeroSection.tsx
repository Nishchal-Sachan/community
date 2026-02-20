import Link from "next/link";

interface HeroSectionProps {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage: string;
  };
}

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80";

export default function HeroSection({ hero }: HeroSectionProps) {
  const title = hero?.title?.trim() || "Community Leader";
  const subtitle = hero?.subtitle?.trim() || "Serving the Community with Integrity and Vision";
  const ctaText = hero?.ctaText?.trim() || "Join Community";
  const backgroundImage = hero?.backgroundImage?.trim() || FALLBACK_BG;

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden sm:min-h-[90vh] lg:min-h-screen">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80"
          aria-hidden="true"
        />
      </div>

      {/* Centered content */}
      <div className="relative mx-auto w-full max-w-4xl px-6 py-16 text-center sm:py-20 md:px-8">
        {/* Leader name */}
        <h1 className="animate-hero-fade-in break-words text-3xl font-bold tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-6xl">
          {title}
        </h1>

        {/* Tagline */}
        <p className="animate-hero-fade-in-delay-1 mx-auto mt-4 max-w-2xl break-words text-base font-medium text-slate-200 drop-shadow-md sm:mt-5 md:mt-6 md:text-lg lg:text-2xl">
          {subtitle}
        </p>

        {/* 2-line description */}
        <p className="animate-hero-fade-in-delay-2 mx-auto mt-4 max-w-xl break-words text-sm leading-relaxed text-slate-300 sm:mt-5 md:mt-6 md:text-base lg:text-lg">
          Committed to fostering local development and ensuring every resident has a voice.
          <br />
          Together we build a neighborhood that works for everyone.
        </p>

        {/* CTAs - stacked on mobile, full-width buttons */}
        <div className="animate-hero-fade-in-delay-3 mt-8 flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:gap-4">
          <Link
            href="#join-community"
            className="inline-flex w-full min-w-0 items-center justify-center rounded-lg bg-slate-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-slate-700 sm:w-auto"
          >
            {ctaText}
          </Link>
          <Link
            href="#upcoming-events"
            className="inline-flex w-full min-w-0 items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            View Events
          </Link>
        </div>
      </div>
    </section>
  );
}
