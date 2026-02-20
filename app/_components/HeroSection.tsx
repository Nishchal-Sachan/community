import Link from "next/link";
import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/lib/models/SiteSettings";

const FALLBACK_TITLE = "Sarah Martinez";
const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80";

async function loadSettings(): Promise<{
  heroTitle: string;
  heroImage: string;
}> {
  try {
    await connectDB();
    const settings = await getSiteSettings();
    return { heroTitle: settings.heroTitle, heroImage: settings.heroImage };
  } catch {
    return { heroTitle: FALLBACK_TITLE, heroImage: FALLBACK_HERO_IMAGE };
  }
}

export default async function HeroSection() {
  const { heroTitle, heroImage } = await loadSettings();
  const bgImage = heroImage.trim() || FALLBACK_HERO_IMAGE;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
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
      <div className="relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
        {/* Leader name */}
        <h1 className="animate-hero-fade-in text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          {heroTitle}
        </h1>

        {/* Tagline */}
        <p className="animate-hero-fade-in-delay-1 mx-auto mt-5 max-w-2xl text-lg font-medium text-slate-200 drop-shadow-md sm:mt-6 sm:text-xl lg:text-2xl">
          Serving the Community with Integrity and Vision
        </p>

        {/* 2-line description */}
        <p className="animate-hero-fade-in-delay-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:mt-6 sm:text-lg">
          Committed to fostering local development and ensuring every resident has a voice.
          <br />
          Together we build a neighborhood that works for everyone.
        </p>

        {/* CTAs */}
        <div className="animate-hero-fade-in-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row">
          <Link
            href="#join-community"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-slate-700 sm:w-auto"
          >
            Join Community
          </Link>
          <Link
            href="#upcoming-events"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            View Events
          </Link>
        </div>
      </div>
    </section>
  );
}
