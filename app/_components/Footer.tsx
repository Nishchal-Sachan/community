import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const ABOUT =
  "अखिल भारतीय कुशवाहा महासभा एक सामाजिक संगठन है, जो शिक्षा, स्वास्थ्य और सम्मान के माध्यम से समाज के सर्वांगीण विकास के लिए कार्यरत है। हमारा उद्देश्य समाज के हर वर्ग को जोड़कर उन्हें सशक्त, जागरूक और आत्मनिर्भर बनाना है।";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "X", href: "https://twitter.com", Icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
] as const;

function SocialIcon({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#222222] text-white transition-colors hover:bg-[#F57C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]"
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
    </a>
  );
}

function BrandLogo() {
  return (
    <Link
      href="/"
      className="flex h-[50px] w-[120px] shrink-0 items-center justify-center rounded border-2 border-[#F57C00] bg-white font-heading text-lg font-bold text-[#F57C00] transition-opacity hover:opacity-90"
      aria-label="ABKM Home"
    >
      ABKM
    </Link>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0f172a]">
      {/* Section 1: Top Brand Bar */}
      <div
        className="flex flex-col items-center justify-between gap-6 border-t-4 border-[#F57C00] bg-[#111111] px-6 py-10 sm:flex-row sm:px-[60px]"
        aria-label="Brand bar"
      >
        <BrandLogo />
        <div className="flex gap-2.5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <SocialIcon key={label} href={href} label={label} Icon={Icon} />
          ))}
        </div>
      </div>

      {/* Section 2: Main Footer */}
      <div className="px-6 py-[80px] sm:px-[60px]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: About */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              About
            </h3>
            <p className="mb-6 font-body text-[15px] leading-relaxed text-[#94a3b8]">
              {ABOUT}
            </p>
            <Link
              href="#about"
              className="inline-block rounded bg-[#F57C00] px-5 py-2.5 font-body text-[15px] font-medium text-white transition-colors hover:bg-[#E65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]"
            >
              About us
            </Link>
          </div>

          {/* Column 2: Office */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              Our Office
            </h3>
            <address className="flex flex-col gap-3 not-italic">
              <p className="font-body text-[15px] leading-relaxed text-[#94a3b8]">
                Naveen Nagar
                <br />
                Kakadev, Kanpur Nagar
              </p>
              <a
                href="mailto:contact@kushwahamahasabha.org"
                className="font-body text-[15px] text-[#94a3b8] transition-colors hover:text-white"
              >
                Email: contact@kushwahamahasabha.org
              </a>
              <a
                href="tel:+919839422115"
                className="font-body text-[15px] text-[#94a3b8] transition-colors hover:text-white"
              >
                Phone: +91 9839422115
              </a>
            </address>
          </div>

          {/* Column 3: Social */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              Social
            </h3>
            <div className="flex flex-col items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <SocialIcon key={label} href={href} label={label} Icon={Icon} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mx-auto mt-10 border-t border-[#222222] pt-5 text-center font-body text-[15px] text-[#94a3b8]">
          © 2026 ABKM
        </div>
      </div>
    </footer>
  );
}
