"use client";

import { useRouter } from "next/navigation";

export default function AdminHeader({ email }: { email: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-300 bg-white px-4">
      <h1 className="text-sm font-semibold text-gray-800">Admin Panel</h1>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="hidden sm:inline">{email}</span>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded border border-gray-300 px-2 py-1 text-gray-800 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
