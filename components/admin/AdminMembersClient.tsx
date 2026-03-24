"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  role: string;
};

export default function AdminMembersClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<unknown>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setRows(j.users ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, action: "approve" | "reject" | "remove_directory") {
    setBusy(`${id}-${action}`);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed");
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
      const j = await res.json();
      if (res.ok) setDetail(j);
    } catch {
      setDetail({ error: "Load failed" });
    }
  }

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
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Name</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Email</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Phone</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">City</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">State</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Status</th>
              <th className="border-b border-gray-300 px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-200">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.phone}</td>
                <td className="px-3 py-2">{r.city}</td>
                <td className="px-3 py-2">{r.state}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => void openDetail(r.id)}
                      className="border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => void patch(r.id, "approve")}
                      className="border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      {busy === `${r.id}-approve` ? "…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => void patch(r.id, "reject")}
                      className="border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      {busy === `${r.id}-reject` ? "…" : "Reject"}
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => {
                        if (confirm("Remove directory entry and reset membership?"))
                          void patch(r.id, "remove_directory");
                      }}
                      className="border border-gray-300 px-2 py-0.5 text-xs text-red-800 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetailId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto border border-gray-300 bg-white p-4 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-between">
              <span className="font-semibold">User details</span>
              <button type="button" onClick={() => setDetailId(null)} className="text-gray-600">
                Close
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all rounded border border-gray-200 bg-gray-50 p-2 text-xs">
              {detail ? JSON.stringify(detail, null, 2) : "Loading…"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
