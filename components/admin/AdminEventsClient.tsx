"use client";

import { useCallback, useEffect, useState } from "react";

type EventRow = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  imageUrl: string;
};

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
};

export default function AdminEventsClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setEvents(j.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(ev: EventRow) {
    setEditId(ev._id);
    setForm({
      title: ev.title,
      description: ev.description,
      date: ev.date.slice(0, 16),
      location: ev.location ?? "",
      imageUrl: ev.imageUrl,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      cancelEdit();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      cancelEdit();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed");
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-0.5 w-full border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <form
        onSubmit={editId ? submitUpdate : submitCreate}
        className="space-y-3 border border-gray-300 bg-white p-4"
      >
        <h3 className="text-sm font-semibold text-gray-800">
          {editId ? "Edit event" : "Create event"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-600">Title</label>
            <input
              className={input}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-600">Description</label>
            <textarea
              className={input}
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Date & time</label>
            <input
              type="datetime-local"
              className={input}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Location</label>
            <input
              className={input}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-600">Image URL</label>
            <input
              className={input}
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="border border-gray-400 bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {editId ? "Save changes" : "Create"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-sm text-gray-600">Loading list…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-300 bg-white">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id} className="border-b border-gray-200">
                  <td className="px-3 py-2">{ev.title}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(ev.date).toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2">{ev.location || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(ev)}
                      className="mr-2 border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(ev._id)}
                      className="border border-gray-300 px-2 py-0.5 text-xs text-red-800 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
