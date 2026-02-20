"use client";

import { useState, FormEvent } from "react";
import Spinner from "@/app/_components/Spinner";

interface Props {
  onEventAdded: () => void;
}

type Status = "idle" | "loading" | "error";

export default function AddEventForm({ onEventAdded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Failed to create event.");
        return;
      }

      setTitle("");
      setDescription("");
      setDate("");
      setImageUrl("");
      setStatus("idle");
      onEventAdded();
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection.");
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ev-title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ev-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="Event title"
            maxLength={150}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ev-date" className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="ev-date"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ev-image" className="block text-sm font-medium text-gray-700">
            Image URL <span className="text-red-500">*</span>
          </label>
          <input
            id="ev-image"
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="ev-desc" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ev-desc"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Describe the event…"
            maxLength={2000}
            className={`${inputClass} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-gray-400">{description.length}/2000</p>
        </div>
      </div>

      {status === "error" && error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
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
          {loading ? "Saving…" : "Add event"}
        </button>
      </div>
    </form>
  );
}
