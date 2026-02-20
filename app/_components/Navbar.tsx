"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#initiatives", label: "Initiatives" },
  { href: "/#upcoming-events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/#contact", label: "Contact" },
];

function NavLink({
  href,
  label,
  onClick,
  inverted,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  inverted?: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : href === "/members"
        ? pathname === "/members"
        : false;

  const base = "block min-h-[44px] py-3 text-base font-medium transition-colors md:min-h-0";
  const desktop = "md:py-0 md:px-4 md:py-2 md:rounded-lg";
  const light =
    isActive
      ? "text-slate-900 md:bg-slate-100"
      : "text-slate-600 hover:text-slate-900 md:hover:bg-slate-100";
  const dark =
    isActive
      ? "text-white"
      : "text-slate-300 hover:text-white";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${desktop} ${inverted ? dark : light}`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900"
            onClick={closeMenu}
          >
            Community
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                inverted={false}
              />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/#join-community"
              className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Join Community
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 md:hidden"
          >
            {open ? (
              <svg
                className="h-6 w-6"
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
                className="h-6 w-6"
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

      {/* Mobile overlay menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      >
        <nav
          className={`flex min-h-full flex-col px-6 pt-24 pb-8 transition-transform duration-300 ease-out ${
            open ? "translate-y-0" : "-translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
          aria-label="Mobile navigation links"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={closeMenu}
                inverted
              />
            ))}
          </div>

          <div className="mt-8 border-t border-slate-700/50 pt-8">
            <Link
              href="/#join-community"
              onClick={closeMenu}
              className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-white px-6 py-4 text-center text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Join Community
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
