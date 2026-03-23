"use client";

import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/auth/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    let target = data.user?.role === "member" ? "/members" : "/join";
    if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
      target = callbackUrl;
    }
    router.push(target);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Container className="flex flex-col items-center gap-6 py-16">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Member Login
        </h1>
        <p className="text-center font-body text-gray-600">
          Log in to access the member area and complete your membership.
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
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded border border-gray-300 px-4 py-3 font-body"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="rounded border border-gray-300 px-4 py-3 font-body"
          />
          <button
            type="submit"
            className="rounded bg-[#F57C00] px-4 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100]"
          >
            Log in
          </button>
        </form>
        <p className="text-center font-body text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#F57C00] underline">
            Register
          </Link>
        </p>
      </Container>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
