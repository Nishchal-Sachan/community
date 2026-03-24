"use client";

import type { ClientReceipt } from "@/lib/payment-receipt-types";
import { buildReceiptStandaloneHtml, RECEIPT_ORG_NAME } from "@/lib/payment-receipt-html";

function receiptToEmailFields(r: ClientReceipt) {
  return {
    fullName: r.fullName,
    planLabelHi: r.plan,
    amountRupees: r.amountRupees,
    paymentId: r.paymentId,
    orderId: r.orderId,
    method: r.method,
    dateFormatted: new Date(r.date).toLocaleString("hi-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

export function downloadReceiptHtmlFile(receipt: ClientReceipt) {
  const html = buildReceiptStandaloneHtml(receiptToEmailFields(receipt));
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${receipt.paymentId}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PaymentSuccessModal({
  open,
  receipt,
  onDone,
  doneLabel,
}: {
  open: boolean;
  receipt: ClientReceipt | null;
  onDone: () => void;
  doneLabel: string;
}) {
  if (!open || !receipt) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-success-title"
    >
      <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white shadow-xl">
        <div className="border-b border-emerald-700 bg-emerald-800 px-4 py-3 text-white">
          <h2 id="pay-success-title" className="font-heading text-lg font-semibold">
            भुगतान सफल हुआ
          </h2>
          <p className="mt-0.5 font-body text-xs opacity-90">{RECEIPT_ORG_NAME}</p>
        </div>

        <div className="p-4 font-body text-sm text-gray-800">
          <p className="mb-3 text-gray-700">आपकी रसीद का सारांश:</p>
          <ul className="space-y-1.5 rounded border border-gray-200 bg-gray-50 p-3">
            <li className="flex justify-between gap-2">
              <span className="text-gray-600">नाम</span>
              <span className="font-medium text-gray-900">{receipt.fullName}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-gray-600">योजना</span>
              <span className="font-medium text-gray-900">{receipt.plan}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-gray-600">राशि</span>
              <span className="font-medium text-gray-900">
                ₹{receipt.amountRupees.toLocaleString("en-IN")}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-gray-600">Payment ID</span>
              <span className="break-all text-right font-mono text-xs text-gray-900">
                {receipt.paymentId}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            पूर्ण विवरण ईमेल पर भेजा गया है (यदि SMTP कॉन्फ़िगर है)।
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
          <button
            type="button"
            onClick={() => downloadReceiptHtmlFile(receipt)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 font-body text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            रसीद डाउनलोड करें
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-md bg-[#F57C00] px-4 py-2.5 font-body text-sm font-medium text-white hover:bg-[#E65100]"
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
