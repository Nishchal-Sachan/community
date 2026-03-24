"use client";

import { useCallback, useEffect, useState } from "react";

type PayRow = {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  planType: string;
  amountRupees: number;
  paymentId: string;
  orderId: string;
  method: string;
  date: string;
};

export default function AdminPaymentsClient() {
  const [plan, setPlan] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<PayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (plan === "membership" || plan === "marriage") p.set("plan", plan);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const res = await fetch(`/api/admin/payments?${p}`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setRows(j.payments ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [plan, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 border border-gray-300 bg-white p-3">
        <div>
          <label className="block text-xs text-gray-600">Plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="mt-0.5 border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="membership">Membership</option>
            <option value="marriage">Marriage</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-0.5 border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-0.5 border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-gray-300 bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
        >
          Apply
        </button>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-300 bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                    No records
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
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
      )}
    </div>
  );
}
