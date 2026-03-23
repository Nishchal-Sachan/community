import { JoinLink } from "@/components/JoinLink";

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

const DEFAULT_TITLE = "Koi Sataye,\nHume Bataye";

const DEFAULT_SUBTITLE = "Standing as a shield for justice and support";

const OVERLAY_GRADIENT =
  "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)";

export default function HeroSection({ hero }: HeroSectionProps) {
  const titleRaw = hero?.title?.trim();
  const titleDisplay = titleRaw || DEFAULT_TITLE;
  const subtitle = hero?.subtitle?.trim() || DEFAULT_SUBTITLE;
  const ctaText = hero?.ctaText?.trim() || "Join ABKM";
  const backgroundImage = hero?.backgroundImage?.trim() || FALLBACK_BG;

  return (
    <section
      className="relative h-[100vh] w-full overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background — z-0 */}
      <div className="absolute inset-0 z-0 h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>

      {/* Overlay — z-1 */}
      <div
        className="absolute inset-0 z-[1] h-full w-full"
        style={{ background: OVERLAY_GRADIENT }}
        aria-hidden="true"
      />

      {/* Content — z-2, left-aligned only */}
      <div className="relative z-[2] mx-auto flex h-full max-w-[1200px] items-center pl-[80px] pr-6 max-sm:pl-6">
        <div className="max-w-[600px] text-left">
          <h1
            id="hero-title"
            className="mb-4 whitespace-pre-line break-words font-heading text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-[72px]"
          >
            {titleDisplay}
          </h1>

          <p className="mb-6 font-body text-[18px] font-normal leading-normal text-[#d1d5db]">
            {subtitle}
          </p>

          <JoinLink
            className="inline-flex items-center justify-center rounded-[6px] bg-[#F57C00] px-7 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
          >
            {ctaText}
          </JoinLink>
        </div>
      </div>
    </section>
  );
}
