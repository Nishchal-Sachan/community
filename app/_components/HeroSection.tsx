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

const DEFAULT_SUBTITLE = "शिक्षा, स्वास्थ्य और सम्मान — कुशवाहा समाज बने महान";
const DEFAULT_TITLE_LINE1 = "Akhil Bhartiya";
const DEFAULT_TITLE_LINE2 = "Kushwaha Mahasabha";

export default function HeroSection({ hero }: HeroSectionProps) {
  const title = hero?.title?.trim() ?? "";
  const subtitle = hero?.subtitle?.trim() || DEFAULT_SUBTITLE;
  const ctaText = hero?.ctaText?.trim() || "समुदाय से जुड़ें";
  const backgroundImage = hero?.backgroundImage?.trim() || FALLBACK_BG;

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
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
        className="absolute inset-0 z-1 h-full w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.2)_70%,rgba(0,0,0,0.05)_100%)]"
        aria-hidden="true"
      />

      {/* Content — z-2; heading block up to ~1152px for balanced wraps */}
      <div className="relative z-2 mx-auto flex h-full w-full max-w-[1200px] items-center px-5 pl-5 sm:pl-20 sm:pr-6 max-sm:justify-center max-sm:text-center">
        <div className="w-full max-w-[min(72rem,calc(100vw-2.5rem))] text-left max-sm:mx-auto max-sm:text-center">
          <h1
            id="hero-title"
            className="w-full font-heading font-bold leading-[1.14] text-white whitespace-normal break-keep text-balance max-sm:text-[36px] sm:text-[52px] md:text-[58px] lg:text-[64px]"
          >
            {title ? (
              title
            ) : (
              <>
                <span className="block sm:inline">{DEFAULT_TITLE_LINE1}</span>
                <span className="hidden sm:inline">&nbsp;</span>
                <span className="block sm:inline">{DEFAULT_TITLE_LINE2}</span>
              </>
            )}
          </h1>

          <p
            className="mt-5 max-w-[min(42rem,calc(100vw-2.5rem))] font-body text-base font-normal leading-relaxed text-white/90 tracking-[0.3px] sm:text-[18px] md:text-[20px] max-sm:mx-auto max-sm:text-center"
          >
            {subtitle}
          </p>

          <JoinLink
            className="mt-7 inline-flex items-center justify-center rounded-md bg-[#F57C00] px-7 py-3 font-body font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E65100] hover:shadow-[0_6px_20px_rgba(245,124,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
          >
            {ctaText}
          </JoinLink>
        </div>
      </div>
    </section>
  );
}
