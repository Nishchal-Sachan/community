"use client";

import {
  categoryLabelHi,
  isValidHelpdeskCategory,
  subLabelHi,
  type HelpdeskCategory,
} from "@/lib/helpdesk-categories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Detail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  subCategory: string;
  location: string;
  description: string;
  urgency: string;
  attachmentUrl: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
};

function formatUrgency(u: string): string {
  const map: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return map[u] ?? u;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminHelpdeskDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/helpdesk/${id}`, {
        credentials: "include",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setDetail(j.request ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setResolved(next: boolean) {
    setBusy("resolved");
    try {
      const res = await fetch(`/api/admin/helpdesk/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resolved: next }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setDetail(j.request);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Delete this help request permanently?")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/helpdesk/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed");
      }
      router.push("/admin/helpdesk");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!detail) return <p className="text-sm text-gray-600">Not found.</p>;

  const cat = detail.category;
  const catLabel = isValidHelpdeskCategory(cat)
    ? categoryLabelHi(cat as HelpdeskCategory)
    : cat;
  const subLabel = isValidHelpdeskCategory(cat)
    ? subLabelHi(cat as HelpdeskCategory, detail.subCategory)
    : detail.subCategory;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/helpdesk"
          className="text-sm text-gray-600 underline hover:text-gray-900"
        >
          ← Back to list
        </Link>
        {detail.resolved ? (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Resolved
          </span>
        ) : (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            Open
          </span>
        )}
      </div>

      <section className="border border-gray-300 bg-white p-4">
        <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
          Category
        </h3>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-gray-500">Primary</dt>
            <dd className="font-medium text-gray-900">{catLabel}</dd>
            <dd className="text-xs text-gray-500">({detail.category})</dd>
          </div>
          <div>
            <dt className="text-gray-500">Subcategory</dt>
            <dd className="font-medium text-gray-900">{subLabel}</dd>
            <dd className="text-xs text-gray-500">({detail.subCategory})</dd>
          </div>
          <div>
            <dt className="text-gray-500">Urgency</dt>
            <dd>{formatUrgency(detail.urgency)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Submitted</dt>
            <dd>{formatDate(detail.createdAt)}</dd>
          </div>
          {detail.resolvedAt ? (
            <div>
              <dt className="text-gray-500">Resolved at</dt>
              <dd>{formatDate(detail.resolvedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="border border-gray-300 bg-white p-4">
        <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
          Contact
        </h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium">{detail.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd>
              <a href={`tel:${detail.phone}`} className="text-blue-700 underline">
                {detail.phone}
              </a>
            </dd>
          </div>
          {detail.email ? (
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd>
                <a href={`mailto:${detail.email}`} className="text-blue-700 underline">
                  {detail.email}
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-gray-500">Location (city / district)</dt>
            <dd>{detail.location}</dd>
          </div>
        </dl>
      </section>

      <section className="border border-gray-300 bg-white p-4">
        <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
          Description
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {detail.description}
        </p>
      </section>

      {detail.attachmentUrl ? (
        <section className="border border-gray-300 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Attachment</h3>
          <a
            href={detail.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 underline break-all"
          >
            {detail.attachmentUrl}
          </a>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        {detail.resolved ? (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => void setResolved(false)}
            className="border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {busy === "resolved" ? "…" : "Reopen"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => void setResolved(true)}
            className="border border-green-600 bg-green-50 px-3 py-1.5 text-sm text-green-900 hover:bg-green-100 disabled:opacity-50"
          >
            {busy === "resolved" ? "…" : "Mark as resolved"}
          </button>
        )}
        <button
          type="button"
          disabled={!!busy}
          onClick={() => void remove()}
          className="border border-red-300 bg-white px-3 py-1.5 text-sm text-red-800 hover:bg-red-50 disabled:opacity-50"
        >
          {busy === "delete" ? "…" : "Delete request"}
        </button>
      </div>
    </div>
  );
}
