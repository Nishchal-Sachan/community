"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { INDIA_STATES_AND_UTS } from "@/lib/india-states";

const selectClass =
  "min-h-[40px] w-full rounded border border-gray-300 bg-white px-3 py-2 pr-9 font-body text-sm text-gray-900 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export function MembersFilters({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get("q") ?? "";
  const stateFromUrl = searchParams.get("state") ?? "";
  const cityFromUrl = searchParams.get("city") ?? "";

  const [searchValue, setSearchValue] = useState(qFromUrl);

  useEffect(() => {
    setSearchValue(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => {
      const next = searchValue.trim();
      const current = (searchParams.get("q") ?? "").trim();
      if (next === current) return;
      const p = new URLSearchParams(searchParams.toString());
      if (next) p.set("q", next);
      else p.delete("q");
      p.set("page", "1");
      router.replace(`${pathname}?${p.toString()}`);
    }, 350);
    return () => clearTimeout(id);
  }, [searchValue, enabled, pathname, router, searchParams]);

  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) {
      setCities([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const qs = stateFromUrl
          ? `?state=${encodeURIComponent(stateFromUrl)}`
          : "";
        const res = await fetch(`/api/members/cities${qs}`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) setCities([]);
          return;
        }
        const data = (await res.json()) as { cities?: string[] };
        if (!cancelled) setCities(data.cities ?? []);
      } catch {
        if (!cancelled) setCities([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, stateFromUrl]);

  const cityOptions = useMemo(() => {
    const out = [...cities].sort((a, b) => a.localeCompare(b, "en"));
    if (cityFromUrl && !out.includes(cityFromUrl)) {
      out.unshift(cityFromUrl);
    }
    return out;
  }, [cities, cityFromUrl]);

  const stateOptions = useMemo(() => [...INDIA_STATES_AND_UTS], []);

  const pushParams = useCallback(
    (update: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      update(p);
      p.set("page", "1");
      router.replace(`${pathname}?${p.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const onStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!enabled) return;
    const v = e.target.value;
    pushParams((p) => {
      if (v) p.set("state", v);
      else p.delete("state");
      p.delete("city");
    });
  };

  const onCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!enabled) return;
    const v = e.target.value;
    pushParams((p) => {
      if (v) p.set("city", v);
      else p.delete("city");
    });
  };

  return (
    <div className="mb-6 grid gap-4 border border-gray-300 bg-white p-4 shadow-sm sm:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <label
          htmlFor="members-search"
          className="mb-1 block font-body text-xs font-medium text-gray-700"
        >
          खोज
        </label>
        {enabled ? (
          <input
            id="members-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white py-2.5 pl-3 pr-3 font-body text-sm text-gray-900 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="Search members (name, city, occupation)"
            autoComplete="off"
            lang="en"
          />
        ) : (
          <div className="relative">
            <input
              type="search"
              disabled
              readOnly
              className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-50 py-2.5 pl-3 pr-10 font-body text-sm text-gray-500"
              placeholder="Search members (name, city, occupation)"
              aria-label="Search — available for active members only"
              lang="en"
            />
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-600"
              aria-hidden
            >
              🔒
            </span>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="members-filter-state"
          className="mb-1 block font-body text-xs font-medium text-gray-700"
        >
          राज्य
        </label>
        <div className="relative">
          <select
            id="members-filter-state"
            value={enabled ? stateFromUrl : ""}
            onChange={onStateChange}
            disabled={!enabled}
            className={selectClass}
            aria-disabled={!enabled}
          >
            <option value="">All States</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {!enabled && (
            <span
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-amber-600"
              aria-hidden
            >
              🔒
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="members-filter-city"
          className="mb-1 block font-body text-xs font-medium text-gray-700"
        >
          शहर
        </label>
        <div className="relative">
          <select
            id="members-filter-city"
            value={enabled ? cityFromUrl : ""}
            onChange={onCityChange}
            disabled={!enabled}
            className={selectClass}
            aria-disabled={!enabled}
          >
            <option value="">All Cities</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {!enabled && (
            <span
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-amber-600"
              aria-hidden
            >
              🔒
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
