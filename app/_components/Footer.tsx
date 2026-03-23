import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const ABOUT =
  "Akhil Bhartiya Kushwaha Mahasabha (ABKM) is a national organisation devoted to member empowerment, community representation, and coordinated action across states—linking rural constituencies with urban networks for shared progress.";

const MEMBERSHIP_ITEMS = [
  "General Membership",
  "Executive Membership",
  "Corporate Membership",
] as const;

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
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-[60px] md:grid-cols-2 xl:grid-cols-4">
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

          {/* Column 2: Membership */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              Membership Options
            </h3>
            <ul className="flex flex-col gap-3 font-body text-[15px] text-[#94a3b8]">
              {MEMBERSHIP_ITEMS.map((item) => (
                <li key={item}>
                  <Link
                    href="#membership"
                    className="transition-colors hover:text-white"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Office */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              Our Office
            </h3>
            <address className="flex flex-col gap-3 not-italic">
              <p className="font-body text-[15px] leading-relaxed text-[#94a3b8]">
                National Secretariat, ABKM
                <br />
                12-A, Community Bhawan Road
                <br />
                Karol Bagh, New Delhi — 110005, India
              </p>
              <a
                href="mailto:example@abkm.org"
                className="font-body text-[15px] text-[#94a3b8] transition-colors hover:text-white"
              >
                Email: example@abkm.org
              </a>
              <a
                href="tel:+919876543210"
                className="font-body text-[15px] text-[#94a3b8] transition-colors hover:text-white"
              >
                Phone: +91 9876543210
              </a>
            </address>
          </div>

          {/* Column 4: Social */}
          <div className="min-w-0">
            <h3 className="mb-4 font-heading text-[18px] font-semibold text-white">
              Social
            </h3>
            <div className="flex flex-wrap gap-2.5">
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
