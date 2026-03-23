"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JoinLink } from "@/components/JoinLink";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCallback, useEffect, useState } from "react";

const EMAIL = "example@abkm.org";
const PHONE_DISPLAY = "+91 9876543210";
const PHONE_TEL = "+919876543210";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/#who-we-are", label: "Who We Are" },
  { href: "/#services", label: "Services" },
  { href: "/jobs", label: "Job Portal" },
  { href: "/matrimony", label: "Matrimony" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
] as const;

function LogoMark() {
  return (
    <div
      className="flex h-[50px] min-w-[50px] shrink-0 items-center justify-center rounded border-2 border-[#F57C00] bg-white font-heading text-[0.65rem] font-bold leading-none text-[#F57C00]"
      aria-hidden
    >
      ABKM
    </div>
  );
}

function MainNavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isHomeActive = href === "/" && pathname === "/";
  const isJobsActive = href === "/jobs" && (pathname === "/jobs" || pathname.startsWith("/jobs/"));
  const isMatrimonyActive = href === "/matrimony" && (pathname === "/matrimony" || pathname.startsWith("/matrimony/"));
  const isActive = isHomeActive || isJobsActive || isMatrimonyActive;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "whitespace-nowrap font-body text-[15px] font-normal transition-colors",
        isActive ? "text-[#F57C00]" : "text-[#444] hover:text-[#F57C00]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refetch } = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    refetch();
    router.push("/");
    router.refresh();
    closeDrawer();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const joinBtnClass =
    "inline-flex shrink-0 items-center justify-center rounded-[4px] bg-[#F57C00] px-[18px] py-2 font-body text-[14px] font-medium text-white transition-colors hover:bg-[#E65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[9999] w-full">
        {/* Top bar */}
        <div className="flex h-9 items-center justify-between bg-[#F57C00] px-[40px] text-white max-sm:px-4">
          <a
            href={`mailto:${EMAIL}`}
            className="min-w-0 truncate font-body text-[13px] text-white hover:opacity-90"
          >
            {EMAIL}
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="shrink-0 pl-2 text-right font-body text-[13px] text-white hover:opacity-90"
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        {/* Main navbar */}
        <div
          className={`flex h-[72px] items-center justify-between border-b border-[#eeeeee] bg-white px-[40px] transition-shadow max-sm:px-4 ${
            scrolled ? "shadow-[0_2px_10px_rgba(0,0,0,0.05)]" : ""
          }`}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-[10px]"
            onClick={closeDrawer}
          >
            <LogoMark />
            <span className="min-w-0 font-body text-[14px] font-semibold leading-[1.2] text-gray-900">
              <span className="block">Akhil Bhartiya</span>
              <span className="block">Kushwaha Mahasabha</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-[28px] lg:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <MainNavLink key={item.href} href={item.href} label={item.label} />
            ))}
            {!loading && (
              user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={joinBtnClass}
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className={joinBtnClass}>
                  Login
                </Link>
              )
            )}
            <JoinLink className={joinBtnClass}>
              Join ABKM
            </JoinLink>
          </nav>

          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            className="flex min-h-11 min-w-11 items-center justify-center rounded text-[#444] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2 lg:hidden"
          >
            {drawerOpen ? (
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 lg:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!drawerOpen}
        onClick={closeDrawer}
      />

      <div
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={[
          "fixed inset-y-0 right-0 z-[110] flex h-full min-h-[100dvh] w-[min(100%,20rem)] flex-col border-l border-[#eeeeee] bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#eeeeee] px-4">
          <span className="font-body text-[14px] font-semibold text-gray-900">Menu</span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded text-[#444] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00]"
          >
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4"
          aria-label="Mobile primary"
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              (item.href === "/" && pathname === "/") ||
              (item.href === "/jobs" && (pathname === "/jobs" || pathname.startsWith("/jobs/"))) ||
              (item.href === "/matrimony" && (pathname === "/matrimony" || pathname.startsWith("/matrimony/")));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`min-h-11 rounded px-3 py-2.5 font-body text-[14px] transition-colors hover:bg-gray-50 hover:text-[#F57C00] ${
                  isActive ? "text-[#F57C00]" : "text-[#444]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-[#eeeeee] p-4">
          {!loading && (
            user ? (
              <button
                type="button"
                onClick={handleLogout}
                className={`${joinBtnClass} w-full`}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeDrawer}
                className={`${joinBtnClass} w-full`}
              >
                Login
              </Link>
            )
          )}
          <JoinLink className={`${joinBtnClass} w-full`} onClick={closeDrawer}>
            Join ABKM
          </JoinLink>
        </div>
      </div>
    </>
  );
}
