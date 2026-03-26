"use client";

import {
  categoryLabelHi,
  isValidHelpdeskCategory,
  type HelpdeskCategory,
} from "@/lib/helpdesk-categories";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  phone: string;
  category: string;
  urgency: string;
  createdAt: string;
  resolved: boolean;
};

function formatUrgency(u: string): string {
  const map: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return map[u] ?? u;
}

function categoryLabel(cat: string): string {
  return isValidHelpdeskCategory(cat)
    ? categoryLabelHi(cat as HelpdeskCategory)
    : cat;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminHelpdeskClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/helpdesk", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setRows(j.requests ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          className="border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-300 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Name</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Phone</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Category</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Urgency</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Date</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Status</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  No help requests yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-200">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.phone}</td>
                  <td className="max-w-[200px] truncate px-3 py-2" title={categoryLabel(r.category)}>
                    {categoryLabel(r.category)}
                  </td>
                  <td className="px-3 py-2">{formatUrgency(r.urgency)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    {r.resolved ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Resolved
                      </span>
                    ) : (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/helpdesk/${r.id}`}
                      className="inline-block border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
