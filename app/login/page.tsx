"use client";

import { Suspense, useState } from "react";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    
    setError(null);
    setIsLoading(true);
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "लॉग इन विफल");
        setIsLoading(false);
        return;
      }
      
      setIsSuccess(true);
      let target = "/members";
      if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        target = callbackUrl;
      }
      router.push(target);
      router.refresh();
    } catch (err) {
      setError("नेटवर्क त्रुटि। कृपया फिर से प्रयास करें।");
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Container className="flex flex-col items-center gap-6 py-16">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          सदस्य लॉग इन
        </h1>
        <p className="text-center font-body text-gray-600">
          सदस्य क्षेत्र तक पहुँचने और सदस्यता पूरी करने के लिए लॉग इन करें।
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
            placeholder="ईमेल"
            required
            disabled={isLoading || isSuccess}
            className="rounded border border-gray-300 px-4 py-3 font-body disabled:opacity-60 disabled:bg-gray-100"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            disabled={isLoading || isSuccess}
            className="rounded border border-gray-300 px-4 py-3 font-body disabled:opacity-60 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            aria-busy={isLoading}
            className={`flex items-center justify-center gap-2 rounded px-4 py-3 font-body font-medium text-white transition-all ${
              isLoading || isSuccess
                ? "cursor-not-allowed bg-[#E65100]/70 opacity-80"
                : "bg-[#F57C00] hover:bg-[#E65100]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>लॉग इन हो रहा है...</span>
              </>
            ) : isSuccess ? (
              <span>लॉग इन सफल...</span>
            ) : (
              <span>लॉग इन</span>
            )}
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50">लोड हो रहा है...</div>}>
      <LoginForm />
    </Suspense>
  );
}
