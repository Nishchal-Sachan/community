"use client";

import { useState, FormEvent } from "react";
import Spinner from "./Spinner";

type Status = "idle" | "loading" | "success" | "error";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const loading = status === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, area }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "कुछ गलत हुआ। कृपया पुनः प्रयास करें।");
        return;
      }

      setStatus("success");
      setMessage(data.message ?? "आप सफलतापूर्वक जुड़ गए हैं!");
      setName("");
      setPhone("");
      setArea("");
    } catch {
      setStatus("error");
      setMessage("नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-base font-semibold text-green-800">{message}</p>
        <button
          onClick={() => { setStatus("idle"); setMessage(null); }}
          className="mt-4 text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900"
        >
          एक और प्रतिक्रिया दें
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-2 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="min-w-0 space-y-5">
      <div>
        <label htmlFor="join-name" className="block text-sm font-medium text-slate-700">
          पूरा नाम <span className="text-red-500">*</span>
        </label>
        <input
          id="join-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="Your full name"
          maxLength={100}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="join-phone" className="block text-sm font-medium text-slate-700">
          फ़ोन नंबर <span className="text-red-500">*</span>
        </label>
        <input
          id="join-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          placeholder="+91 98765 43210"
          maxLength={20}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="join-area" className="block text-sm font-medium text-slate-700">
          क्षेत्र / स्थान <span className="text-red-500">*</span>
        </label>
        <input
          id="join-area"
          type="text"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
          disabled={loading}
          placeholder="शहर या इलाका"
          maxLength={100}
          className={inputClass}
        />
      </div>

      {status === "error" && message && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-disabled={loading}
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
      >
        {loading && <Spinner />}
        {loading ? "जमा हो रहा है…" : "सदस्यता लें"}
      </button>
    </form>
  );
}
