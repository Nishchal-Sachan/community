"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "पंजीकरण विफल");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Container className="flex flex-col items-center gap-6 py-16">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          खाता बनाएं
        </h1>
        <p className="text-center font-body text-gray-600">
          ABKM से जुड़ने और सदस्य लाभ प्राप्त करने के लिए पंजीकरण करें।
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-4"
        >
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <input
            type="text"
            name="name"
            placeholder="पूरा नाम"
            required
            className="rounded border border-gray-300 px-4 py-3 font-body"
          />
          <input
            type="email"
            name="email"
            placeholder="ईमेल"
            required
            className="rounded border border-gray-300 px-4 py-3 font-body"
          />
          <input
            type="password"
            name="password"
            placeholder="पासवर्ड (कम से कम 8 अक्षर)"
            required
            minLength={8}
            className="rounded border border-gray-300 px-4 py-3 font-body"
          />
          <button
            type="submit"
            className="rounded bg-[#F57C00] px-4 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100]"
          >
            पंजीकरण करें
          </button>
        </form>
        <p className="text-center font-body text-sm text-gray-500">
          पहले से खाता है?{" "}
          <Link href="/login" className="font-medium text-[#F57C00] underline">
            लॉग इन करें
          </Link>
        </p>
      </Container>
    </main>
  );
}
