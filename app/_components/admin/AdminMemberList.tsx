"use client";

import { useState, useEffect, useCallback } from "react";
import Spinner from "@/app/_components/Spinner";

interface Member {
  _id: string;
  name: string;
  area: string;
  joinedAt: string;
  isPublic: boolean;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminMemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async (p: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members?page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.members ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setError("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(page);
  }, [fetchMembers, page]);

  async function handleToggleVisibility(id: string) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/members/${id}/visibility`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to update visibility.");
        return;
      }
      const data = await res.json();
      setMembers((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, isPublic: data.member.isPublic } : m
        )
      );
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Members</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Manage member visibility on the public members page. Toggle to show or hide.
      </p>

      {loading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
          No members yet.
        </div>
      )}

      {!loading && !error && members.length > 0 && (
        <>
          <div className="mt-6 space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.area}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {member.isPublic ? "Public" : "Hidden"}
                  </span>
                  <button
                    onClick={() => handleToggleVisibility(member._id)}
                    disabled={togglingId === member._id}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {togglingId === member._id ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      "Toggle"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
