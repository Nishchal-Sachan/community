"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/helpdesk", label: "Helpdesk" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/content", label: "Content Management" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-gray-300 bg-white">
      <div className="border-b border-gray-300 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Administration
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">ABKM Console</p>
      </div>
      <nav className="flex flex-col p-2">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded border px-3 py-2 text-sm",
                active
                  ? "border-gray-400 bg-gray-100 font-medium text-gray-900"
                  : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
