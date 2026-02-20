"use client";

import { useState, FormEvent } from "react";
import Spinner from "@/app/_components/Spinner";

interface Props {
  initialTitle: string;
  initialImage: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function HeroSettingsForm({ initialTitle, initialImage }: Props) {
  const [heroTitle, setHeroTitle] = useState(initialTitle);
  const [heroImage, setHeroImage] = useState(initialImage);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const loading = status === "loading";

  function resetFeedback() {
    if (status !== "idle") { setStatus("idle"); setMessage(null); }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroTitle, heroImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to save settings.");
        return;
      }

      setStatus("success");
      setMessage("Settings saved successfully.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-4">
      <div>
        <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700">
          Hero Title <span className="text-red-500">*</span>
        </label>
        <input
          id="hero-title"
          type="text"
          required
          value={heroTitle}
          onChange={(e) => { setHeroTitle(e.target.value); resetFeedback(); }}
          disabled={loading}
          placeholder="Welcome to Club App"
          maxLength={200}
          className={inputClass}
        />
        <p className="mt-1 text-right text-xs text-gray-400">{heroTitle.length}/200</p>
      </div>

      <div>
        <label htmlFor="hero-image" className="block text-sm font-medium text-gray-700">
          Hero Image URL{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="hero-image"
          type="url"
          value={heroImage}
          onChange={(e) => { setHeroImage(e.target.value); resetFeedback(); }}
          disabled={loading}
          placeholder="https://example.com/hero.jpg"
          className={inputClass}
        />

        {heroImage.trim() && (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.trim()}
              alt="Hero preview"
              className="h-32 w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </div>

      {status === "error" && message && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}
      {status === "success" && message && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
