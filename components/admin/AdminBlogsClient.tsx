"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: string;
};

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

export default function AdminBlogsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blogs", { credentials: "include" });
      const j = (await res.json()) as {
        error?: string;
        blogs?: Record<string, unknown>[];
      };
      if (!res.ok) throw new Error(j.error ?? "Failed");
      const list = (j.blogs ?? []).map((b) => ({
        id: String(b.id ?? ""),
        title: String(b.title ?? ""),
        slug: String(b.slug ?? ""),
        category: String(b.category ?? ""),
        tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
        published: Boolean(b.published),
        createdAt: String(b.createdAt ?? ""),
      }));
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublished(id: string, published: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ published: !published }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (
      !window.confirm(
        "Delete this post permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
        <Link
          href="/admin/blogs/new"
          className="border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          New post
        </Link>
      </div>

      <div className="overflow-x-auto border border-gray-300 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Title
              </th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Category
              </th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Tags
              </th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Status
              </th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Created
              </th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  No posts yet. Create one to get started.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-200">
                  <td className="max-w-[220px] px-3 py-2">
                    <span className="font-medium text-gray-900">{r.title}</span>
                    <div className="truncate text-xs text-gray-500" title={r.slug}>
                      /{r.slug}
                    </div>
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2 text-gray-700">
                    {r.category || "—"}
                  </td>
                  <td
                    className="max-w-[180px] truncate px-3 py-2 text-gray-600"
                    title={r.tags.join(", ")}
                  >
                    {r.tags.length ? r.tags.join(", ") : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.published ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        Live
                      </span>
                    ) : (
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/admin/blogs/${r.id}`}
                        className="inline-block border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void togglePublished(r.id, r.published)}
                        className="border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                      >
                        {r.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void remove(r.id)}
                        className="border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-800 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
