"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const EMAIL = "contact@kushwahamahasabha.org";
const PHONE_DISPLAY = "+91 9839422115";
const PHONE_TEL = "+919839422115";

const NAV_ITEMS = [
  { href: "/", label: "मुख्य पृष्ठ" },
  { href: "/who-we-are", label: "हमारे बारे में" },
  { href: "/who-we-are#services", label: "सेवाएं" },
  { href: "/jobs", label: "रोजगार पोर्टल" },
  { href: "/matrimony", label: "वैवाहिक" },
  { href: "/gallery", label: "गैलरी" },
  { href: "/blog", label: "Blogs" },
  { href: "/helpdesk", label: "शिकायत पोर्टल" },
] as const;

function LogoMark() {
  return (
    <div
      className="flex h-12.5 min-w-12.5 shrink-0 items-center justify-center rounded border-2 border-[#F57C00] bg-white font-heading text-[0.65rem] font-bold leading-none text-[#F57C00]"
      aria-hidden
    >
      ABKM
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function MainNavLink({
  href,
  label,
  onNavigate,
  suffix,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  suffix?: ReactNode;
}) {
  const pathname = usePathname();
  const isHomeActive = href === "/" && pathname === "/";
  const isJobsActive =
    href === "/jobs" && (pathname === "/jobs" || pathname.startsWith("/jobs/"));
  const isMatrimonyActive =
    href === "/matrimony" &&
    (pathname === "/matrimony" ||
      pathname.startsWith("/matrimony/") ||
      pathname.startsWith("/marriage/"));
  const isGalleryActive = href === "/gallery" && pathname === "/gallery";
  const isBlogActive =
    href === "/blog" &&
    (pathname === "/blog" || pathname.startsWith("/blog/"));
  const isHelpdeskActive = href === "/helpdesk" && pathname === "/helpdesk";
  const isActive =
    isHomeActive ||
    isJobsActive ||
    isMatrimonyActive ||
    isGalleryActive ||
    isBlogActive ||
    isHelpdeskActive;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "inline-flex items-center gap-1 whitespace-nowrap font-body text-[15px] font-normal transition-colors",
        isActive ? "text-[#F57C00]" : "text-[#444] hover:text-[#F57C00]",
      ].join(" ")}
    >
      <span>{label}</span>
      {suffix}
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
      {/* Top bar — fixed; does not affect document flow (spacing is on root layout `pt-[var(--site-header-offset)]`). */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-12 min-h-12 w-full items-center justify-between bg-orange-500 px-6 py-2 text-sm text-white max-sm:px-4">
        <a
          href={`mailto:${EMAIL}`}
          className="min-w-0 truncate font-body text-white hover:opacity-90"
        >
          {EMAIL}
        </a>
        <a
          href={`tel:${PHONE_TEL}`}
          className="shrink-0 pl-2 text-right font-body text-white hover:opacity-90"
        >
          {PHONE_DISPLAY}
        </a>
      </div>

      {/* Main navbar — fixed below top bar; z-50; overlays use higher z so drawer/backdrop sit on top when open */}
      <header className="fixed left-0 right-0 top-12 z-50 w-full">
        <div
          className={`flex h-18 items-center justify-between border-b border-[#eeeeee] bg-white px-10 transition-shadow max-sm:px-4 ${
            scrolled ? "shadow-[0_2px_10px_rgba(0,0,0,0.08)]" : "shadow-md"
          }`}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5"
            onClick={closeDrawer}
          >
            <LogoMark />
            <span className="min-w-0 font-body text-[14px] font-semibold leading-[1.2] text-gray-900">
              <span className="block">अखिल भारतीय</span>
              <span className="block">कुशवाहा महासभा</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => {
              const jobsLocked =
                item.href === "/jobs" &&
                user &&
                user.membershipStatus !== "active";
              return (
                <MainNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  suffix={
                    jobsLocked ? (
                      <LockIcon className="shrink-0 text-amber-600" />
                    ) : null
                  }
                />
              );
            })}
            {!loading &&
              (user ? (
                <>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={joinBtnClass}
                  >
                    लॉग आउट
                  </button>
                  <Link href="/member-portal" className={joinBtnClass}>
                    मेम्बर पोर्टल
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className={joinBtnClass}>
                    लॉग इन
                  </Link>
                  <Link href="/join" className={joinBtnClass}>
                    ABKM से जुड़ें
                  </Link>
                </>
              ))}
          </nav>

          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? "मेनू बंद करें" : "मेनू खोलें"}
            aria-expanded={drawerOpen ? "true" : "false"}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop — above navbar (z-50), below drawer */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 top-12 z-[55] bg-black/40 transition-opacity duration-300 lg:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!drawerOpen ? "true" : "false"}
        onClick={closeDrawer}
      />

      {/* Mobile drawer — above backdrop */}
      <div
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={[
          "fixed right-0 top-12 z-[60] flex h-[calc(100vh-3rem)] w-[min(100%,20rem)] flex-col border-l border-[#eeeeee] bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-[#eeeeee] px-4">
          <span className="font-body text-[14px] font-semibold text-gray-900">
            मेनू
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="मेनू बंद करें"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
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
              (item.href === "/jobs" &&
                (pathname === "/jobs" || pathname.startsWith("/jobs/"))) ||
              (item.href === "/matrimony" &&
                (pathname === "/matrimony" ||
                  pathname.startsWith("/matrimony/") ||
                  pathname.startsWith("/marriage/"))) ||
              (item.href === "/gallery" && pathname === "/gallery") ||
              (item.href === "/blog" &&
                (pathname === "/blog" || pathname.startsWith("/blog/"))) ||
              (item.href === "/helpdesk" && pathname === "/helpdesk");
            const jobsLocked =
              item.href === "/jobs" &&
              user &&
              user.membershipStatus !== "active";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`flex min-h-11 items-center gap-1.5 rounded px-3 py-2.5 font-body text-[14px] transition-colors hover:bg-gray-50 hover:text-[#F57C00] ${
                  isActive ? "text-[#F57C00]" : "text-[#444]"
                }`}
              >
                <span>{item.label}</span>
                {jobsLocked ? (
                  <LockIcon className="shrink-0 text-amber-600" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-[#eeeeee] p-4">
          {!loading &&
            (user ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${joinBtnClass} w-full`}
                >
                  Logout
                </button>
                <Link
                  href="/member-portal"
                  onClick={closeDrawer}
                  className={`${joinBtnClass} w-full text-center`}
                >
                  मेम्बर पोर्टल
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeDrawer}
                  className={`${joinBtnClass} w-full text-center`}
                >
                  Login
                </Link>
                <Link
                  href="/join"
                  onClick={closeDrawer}
                  className={`${joinBtnClass} w-full text-center`}
                >
                  ABKM से जुड़ें
                </Link>
              </>
            ))}
        </div>
      </div>
    </>
  );
}
