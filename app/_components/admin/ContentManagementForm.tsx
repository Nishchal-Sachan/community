"use client";

import { useState, FormEvent } from "react";
import Spinner from "@/app/_components/Spinner";
import type { PageContentData } from "@/lib/content-fetch";

interface Initiative {
  title: string;
  description: string;
  icon: string;
}

const ICON_OPTIONS = [
  { value: "academic", label: "Academic" },
  { value: "users", label: "Users" },
  { value: "tools", label: "Tools" },
  { value: "heart", label: "Heart" },
];

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  initialContent: PageContentData;
}

export default function ContentManagementForm({ initialContent }: Props) {
  const [hero, setHero] = useState(initialContent.hero);
  const [about, setAbout] = useState(initialContent.about);
  const [initiatives, setInitiatives] = useState<Initiative[]>(
    [...initialContent.initiatives]
  );
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const loading = status === "loading";

  function resetFeedback() {
    if (status !== "idle") {
      setStatus("idle");
      setMessage(null);
    }
  }

  function addInitiative() {
    if (initiatives.length >= 12) return;
    setInitiatives([
      ...initiatives,
      { title: "", description: "", icon: "academic" },
    ]);
    resetFeedback();
  }

  function removeInitiative(index: number) {
    if (initiatives.length <= 1) return;
    setInitiatives(initiatives.filter((_, i) => i !== index));
    resetFeedback();
  }

  function updateInitiative(index: number, field: keyof Initiative, value: string) {
    setInitiatives(
      initiatives.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
    resetFeedback();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const validInitiatives = initiatives.filter(
      (i) => i.title.trim() && i.description.trim() && i.icon.trim()
    );
    if (validInitiatives.length < 1) {
      setStatus("error");
      setMessage("At least one initiative with title and description is required.");
      return;
    }
    if (validInitiatives.length > 12) {
      setStatus("error");
      setMessage("Maximum 12 initiatives allowed.");
      return;
    }

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: {
            title: hero.title.trim(),
            subtitle: hero.subtitle.trim(),
            ctaText: hero.ctaText.trim(),
            backgroundImage: hero.backgroundImage.trim(),
          },
          about: {
            bio: about.bio.trim(),
            leaderImage: about.leaderImage.trim(),
          },
          initiatives: validInitiatives.map((i) => ({
            title: i.title.trim(),
            description: i.description.trim(),
            icon: i.icon.trim(),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to save content.");
        return;
      }

      setStatus("success");
      setMessage("Content saved successfully.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={loading}
      className="space-y-8"
    >
      {/* Hero */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Hero</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hero-title" className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="hero-title"
              type="text"
              required
              value={hero.title}
              onChange={(e) => {
                setHero((p) => ({ ...p, title: e.target.value }));
                resetFeedback();
              }}
              disabled={loading}
              maxLength={200}
              className={inputClass}
            />
            <p className="mt-0.5 text-right text-xs text-gray-400">
              {hero.title.length}/200
            </p>
          </div>
          <div>
            <label htmlFor="hero-subtitle" className={labelClass}>
              Subtitle <span className="text-red-500">*</span>
            </label>
            <input
              id="hero-subtitle"
              type="text"
              required
              value={hero.subtitle}
              onChange={(e) => {
                setHero((p) => ({ ...p, subtitle: e.target.value }));
                resetFeedback();
              }}
              disabled={loading}
              maxLength={300}
              className={inputClass}
            />
            <p className="mt-0.5 text-right text-xs text-gray-400">
              {hero.subtitle.length}/300
            </p>
          </div>
          <div>
            <label htmlFor="hero-cta" className={labelClass}>
              CTA text <span className="text-red-500">*</span>
            </label>
            <input
              id="hero-cta"
              type="text"
              required
              value={hero.ctaText}
              onChange={(e) => {
                setHero((p) => ({ ...p, ctaText: e.target.value }));
                resetFeedback();
              }}
              disabled={loading}
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hero-bg" className={labelClass}>
              Background image URL
            </label>
            <input
              id="hero-bg"
              type="url"
              value={hero.backgroundImage}
              onChange={(e) => {
                setHero((p) => ({ ...p, backgroundImage: e.target.value }));
                resetFeedback();
              }}
              disabled={loading}
              placeholder="https://example.com/hero.jpg"
              className={inputClass}
            />
            {hero.backgroundImage.trim() && (
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.backgroundImage.trim()}
                  alt="Hero preview"
                  className="h-24 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">About</h3>
        <div>
          <label htmlFor="about-bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="about-bio"
            rows={6}
            value={about.bio}
            onChange={(e) => {
              setAbout((p) => ({ ...p, bio: e.target.value }));
              resetFeedback();
            }}
            disabled={loading}
            className={inputClass}
            placeholder="About the leader..."
          />
        </div>
        <div>
          <label htmlFor="about-image" className={labelClass}>
            Leader image URL
          </label>
          <input
            id="about-image"
            type="url"
            value={about.leaderImage}
            onChange={(e) => {
              setAbout((p) => ({ ...p, leaderImage: e.target.value }));
              resetFeedback();
            }}
            disabled={loading}
            placeholder="https://example.com/leader.jpg"
            className={inputClass}
          />
          {about.leaderImage.trim() && (
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.leaderImage.trim()}
                alt="Leader preview"
                className="h-32 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Initiatives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Initiatives</h3>
          <button
            type="button"
            onClick={addInitiative}
            disabled={loading || initiatives.length >= 12}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add initiative
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {initiatives.length}/12 initiatives. Add, edit, or delete below.
        </p>

        <div className="space-y-4">
          {initiatives.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Initiative {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeInitiative(index)}
                  disabled={loading || initiatives.length <= 1}
                  className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="sr-only">Title</label>
                  <input
                    type="text"
                    required
                    value={item.title}
                    onChange={(e) =>
                      updateInitiative(index, "title", e.target.value)
                    }
                    disabled={loading}
                    placeholder="Title"
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="sr-only">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={item.description}
                    onChange={(e) =>
                      updateInitiative(index, "description", e.target.value)
                    }
                    disabled={loading}
                    placeholder="Description"
                    maxLength={500}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="sr-only">Icon</label>
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      updateInitiative(index, "icon", e.target.value)
                    }
                    disabled={loading}
                    className={inputClass}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {status === "error" && message && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </div>
      )}
      {status === "success" && message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
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
          {loading ? "Saving…" : "Save content"}
        </button>
      </div>
    </form>
  );
}
