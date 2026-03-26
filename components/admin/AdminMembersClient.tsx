"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

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

type DetailUser = {
  id: string;
  name: string;
  email: string;
  membershipStatus: string;
  role: string;
  membershipIsPaid?: boolean;
  marriageSubscriptionStatus?: string;
  createdAt?: string;
};

type DetailMember = {
  phone?: string;
  city?: string;
  state?: string;
  area?: string;
  occupation?: string;
  email?: string;
  joinedAt?: string;
  isPublic?: boolean;
} | null;

type UserDetailPayload = {
  user: DetailUser;
  member: DetailMember;
};

/** ISO string → readable date via `toLocaleDateString()` (locale-aware, e.g. 24 Mar 2026 in en-GB). */
function formatIsoDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
}

function membershipStatusLabel(status: string): string {
  const s = String(status ?? "").toLowerCase();
  if (s === "active") return "Active";
  if (s === "pending") return "Pending";
  if (s === "none") return "Inactive";
  return status || "—";
}

function MembershipStatusBadge({ status }: { status: string }) {
  const s = String(status ?? "").toLowerCase();
  const label = membershipStatusLabel(status);
  const base = "inline-flex items-center px-2 py-1 rounded text-xs font-semibold";
  const className =
    s === "active"
      ? `${base} bg-green-100 text-green-700`
      : s === "pending"
        ? `${base} bg-amber-100 text-amber-800`
        : `${base} bg-red-100 text-red-700`;
  return <span className={className}>{label}</span>;
}

function marriageSubscriptionLabel(v: string | undefined): string {
  if (!v || v === "none") return "None";
  if (v === "active") return "Active";
  return String(v);
}

function avatarLetter(name: string | undefined): string {
  const t = String(name ?? "").trim();
  if (!t) return "?";
  return t[0].toLocaleUpperCase();
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
        {title}
      </h3>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  valueBold = true,
}: {
  label: string;
  value: ReactNode;
  /** Set false for badges / custom nodes that bring their own weight */
  valueBold?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <div
        className={
          valueBold
            ? "mt-0.5 break-words font-bold text-gray-900"
            : "mt-0.5 text-gray-900"
        }
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

function UserDetailBody({ data }: { data: UserDetailPayload }) {
  const { user, member } = data;

  // API: user.*
  const name = String(user.name ?? "").trim() || "—";
  const email = String(user.email ?? "").trim() || "—";
  const roleRaw = String(user.role ?? "").trim();
  const roleDisplay =
    roleRaw === "member" ? "Member" : roleRaw === "user" ? "User" : roleRaw || "—";

  // API: member.* (directory may be absent)
  const phone = member?.phone != null ? String(member.phone).trim() : "";
  const city = member?.city != null ? String(member.city).trim() : "";
  const state = member?.state != null ? String(member.state).trim() : "";
  const area = member?.area != null ? String(member.area).trim() : "";
  const occupation = member?.occupation != null ? String(member.occupation).trim() : "";
  const joinedAtStr =
    member?.joinedAt != null ? String(member.joinedAt) : undefined;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <DetailCard title="Basic Info">
        <Field label="Name" value={name} />
        <Field label="Email" value={email} />
        <Field label="Role" value={roleDisplay} />
      </DetailCard>

      <DetailCard title="Membership">
        <Field
          label="Status"
          value={<MembershipStatusBadge status={user.membershipStatus} />}
          valueBold={false}
        />
        <Field
          label="Marriage Subscription"
          value={marriageSubscriptionLabel(user.marriageSubscriptionStatus)}
        />
      </DetailCard>

      <DetailCard title="Contact">
        <Field label="Phone" value={phone || "—"} />
        <Field label="Email" value={email} />
      </DetailCard>

      <DetailCard title="Location">
        <Field label="City" value={city || "—"} />
        <Field label="State" value={state || "—"} />
        <Field label="Area" value={area || "—"} />
      </DetailCard>

      <div className="md:col-span-2">
        <DetailCard title="Other">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Occupation" value={occupation || "—"} />
            <Field label="Joined Date" value={formatIsoDate(joinedAtStr)} />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}

export default function AdminMembersClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetailPayload | { error: string } | null>(null);
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
      const j = (await res.json()) as UserDetailPayload | { error?: string };
      if (res.ok && "user" in j && j.user) {
        setDetail(j as UserDetailPayload);
      } else {
        setDetail({ error: (j as { error?: string }).error ?? "Load failed" });
      }
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
                <td className="px-3 py-2">
                  <MembershipStatusBadge status={r.status} />
                </td>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
          onClick={() => setDetailId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-details-title"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-semibold text-white shadow-inner ring-1 ring-black/5"
                  aria-hidden
                >
                  {!detail
                    ? "…"
                    : "error" in detail
                      ? "?"
                      : avatarLetter(detail.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Member details
                  </p>
                  <h2
                    id="member-details-title"
                    className="truncate text-lg font-semibold tracking-tight text-gray-900"
                  >
                    {!detail
                      ? "Loading…"
                      : "error" in detail
                        ? "Unable to load"
                        : String(detail.user.name ?? "").trim() || "—"}
                  </h2>
                  <p className="truncate text-sm text-gray-500">
                    {!detail
                      ? "\u00a0"
                      : "error" in detail
                        ? "Try again or close"
                        : String(detail.user.email ?? "").trim() || "—"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Close
              </button>
            </header>
            <div className="max-h-[calc(90vh-4.25rem)] overflow-y-auto px-5 py-5">
              {!detail ? (
                <p className="text-sm text-gray-600">Loading…</p>
              ) : "error" in detail ? (
                <p className="text-sm text-red-700">{detail.error}</p>
              ) : (
                <UserDetailBody data={detail} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
