"use client";

import { useState, useEffect, useCallback } from "react";
import AddEventForm from "./AddEventForm";
import EditEventForm from "./EditEventForm";

interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
}

export default function AdminEventList() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to delete event.");
        return;
      }
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Add Event Form */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Add New Event</h2>
        <p className="mt-0.5 text-sm text-gray-500">Fill in the details to publish a new event.</p>
        <div className="mt-5">
          <AddEventForm onEventAdded={fetchEvents} />
        </div>
      </section>

      {/* Events List */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          All Events{" "}
          {!loading && (
            <span className="ml-1 text-sm font-normal text-gray-500">({events.length})</span>
          )}
        </h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
            No events yet. Add one above.
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-3">
            {events.map((event) => {
              if (editingId === event._id) {
                return (
                  <div
                    key={event._id}
                    className="rounded-xl border border-blue-200 bg-blue-50/30 p-4"
                  >
                    <EditEventForm
                      event={event}
                      onSuccess={() => {
                        setEditingId(null);
                        fetchEvents();
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                );
              }

              const formattedDate = new Date(event.date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={event._id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/56x56?text=?";
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{event.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{formattedDate}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-400">{event.description}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingId(event._id)}
                      disabled={!!deletingId}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      disabled={deletingId === event._id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === event._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
