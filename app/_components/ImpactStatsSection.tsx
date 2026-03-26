"use client";

import { useEffect, useState } from "react";

type PlatformStats = {
  members: number;
  jobs: number;
  jobSeekers: number;
  events: number;
  educationSupport: number;
};

const DEFAULT_STATS: PlatformStats = {
  members: 0,
  jobs: 0,
  jobSeekers: 0,
  events: 0,
  educationSupport: 0,
};

const IMPACT_ROWS = [
  {
    key: "members" as const,
    label: "सदस्य",
    sub: "देशभर में सक्रिय सदस्य नेटवर्क",
  },
  {
    key: "employment" as const,
    label: "रोजगार अवसर",
    sub: "नौकरी पोस्ट व खोजकर्ता प्रोफ़ाइल",
  },
  {
    key: "educationSupport" as const,
    label: "शिक्षा सहायता",
    sub: "छात्रों को मार्गदर्शन प्रदान किया (प्रशासन अद्यतन)",
  },
  {
    key: "events" as const,
    label: "कार्यक्रम",
    sub: "सामाजिक और जागरूकता आयोजन",
  },
];

function parseNonNegative(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function normalizeStats(raw: unknown): PlatformStats {
  const d = DEFAULT_STATS;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Record<string, unknown>;
  return {
    members: parseNonNegative(o.members, d.members),
    jobs: parseNonNegative(o.jobs, d.jobs),
    jobSeekers: parseNonNegative(o.jobSeekers, d.jobSeekers),
    events: parseNonNegative(o.events, d.events),
    educationSupport: parseNonNegative(
      o.educationSupport,
      d.educationSupport
    ),
  };
}

function formatImpactDisplay(n: number): string {
  const safe = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  return `${safe.toLocaleString("hi-IN")}+`;
}

function ImpactStatSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
      <div
        className="h-8 w-24 max-w-[70%] animate-pulse rounded-md bg-gray-200 md:h-9"
        aria-hidden
      />
      <div
        className="mt-3 h-4 w-20 animate-pulse rounded bg-gray-100"
        aria-hidden
      />
      <div
        className="mt-2 h-3 w-full max-w-[90%] animate-pulse rounded bg-gray-100"
        aria-hidden
      />
    </div>
  );
}

export default function ImpactStatsSection() {
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("stats request failed");
        const json: unknown = await res.json();
        if (!cancelled) setStats(normalizeStats(json));
      } catch {
        if (!cancelled) setStats(DEFAULT_STATS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="impact"
      className="scroll-mt-20 border-b border-gray-200 bg-gray-50 py-20 px-6 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-left">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
            Impact
          </p>
          <h2 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">
            हमारा प्रभाव
          </h2>
        </div>
        <div
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
          aria-busy={loading}
          aria-live="polite"
        >
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <ImpactStatSkeleton key={i} />
              ))
            : IMPACT_ROWS.map((row) => {
                const raw =
                  row.key === "members"
                    ? stats.members
                    : row.key === "employment"
                      ? stats.jobs + stats.jobSeekers
                      : row.key === "educationSupport"
                        ? stats.educationSupport
                        : stats.events;
                return (
                  <div
                    key={row.key}
                    className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm"
                  >
                    <p className="font-heading text-2xl font-bold text-[#F57C00] md:text-3xl">
                      {formatImpactDisplay(raw)}
                    </p>
                    <p className="mt-2 font-body text-[15px] font-medium text-gray-800">
                      {row.label}
                    </p>
                    <p className="mt-1 font-body text-[14px] leading-[1.7] text-gray-600">
                      {row.sub}
                    </p>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
