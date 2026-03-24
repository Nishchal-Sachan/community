"use client";

import { useCallback, useEffect, useState } from "react";

type Recent = {
  id: string;
  fullName: string;
  plan: string;
  amountRupees: number;
  paymentId: string;
  orderId: string;
  method: string;
  date: string;
};

type Stats = {
  totalMembers: number;
  activeMembers: number;
  totalPayments: number;
  recentTransactions: Recent[];
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed to load");
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total directory profiles", value: data.totalMembers },
          { label: "Active members (accounts)", value: data.activeMembers },
          { label: "Total payments", value: data.totalPayments },
        ].map((c) => (
          <div
            key={c.label}
            className="border border-gray-300 bg-white px-4 py-3"
          >
            <p className="text-xs text-gray-600">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Recent transactions</h3>
        <div className="overflow-x-auto border border-gray-300 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Name</th>
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Plan</th>
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Amount</th>
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Payment ID</th>
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Method</th>
                <th className="border-b border-gray-300 px-3 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                    No payments yet
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((r) => (
                  <tr key={r.id} className="border-b border-gray-200">
                    <td className="px-3 py-2">{r.fullName}</td>
                    <td className="px-3 py-2">{r.plan}</td>
                    <td className="px-3 py-2">₹{r.amountRupees}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.paymentId}</td>
                    <td className="px-3 py-2">{r.method}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {new Date(r.date).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
