"use client";

import { useEffect } from "react";

export function PaymentReceiptPreviewModal({
  open,
  onClose,
  fullName,
  email,
  planLabelHi,
  amountRupees,
  previewDateLabel,
  onContinue,
  continueLoading,
  continueLabel = "भुगतान जारी रखें",
}: {
  open: boolean;
  onClose: () => void;
  fullName: string;
  email: string;
  planLabelHi: string;
  amountRupees: number;
  previewDateLabel: string;
  onContinue: () => void;
  continueLoading: boolean;
  continueLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-preview-title"
    >
      <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white shadow-xl">
        <div className="border-b border-gray-200 bg-gray-900 px-4 py-3 text-white">
          <h2 id="receipt-preview-title" className="font-heading text-lg font-semibold">
            भुगतान पूर्वावलोकन
          </h2>
          <p className="mt-0.5 font-body text-xs opacity-90">Akhil Bhartiya Kushwaha Mahasabha</p>
        </div>

        <div className="space-y-3 p-4 font-body text-sm text-gray-800">
          <dl className="space-y-2 rounded border border-gray-200 bg-gray-50/80 p-3">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">सदस्य का नाम</dt>
              <dd className="text-right font-medium text-gray-900">{fullName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">ईमेल</dt>
              <dd className="break-all text-right font-medium text-gray-900">{email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">योजना</dt>
              <dd className="text-right font-medium text-gray-900">{planLabelHi}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">राशि</dt>
              <dd className="text-right font-medium text-gray-900">
                ₹{amountRupees.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">दिनांक</dt>
              <dd className="text-right font-medium text-gray-900">{previewDateLabel}</dd>
            </div>
          </dl>

          <p className="text-xs text-gray-500">
            आगे बढ़ने पर सुरक्षित भुगतान गेटवे खुलेगा। विवरण सर्वर पर सत्यापित किए जाएंगे।
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={continueLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 font-body text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            रद्द करें
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={continueLoading}
            className="rounded-md bg-[#F57C00] px-4 py-2.5 font-body text-sm font-medium text-white hover:bg-[#E65100] disabled:opacity-70"
          >
            {continueLoading ? "कृपया प्रतीक्षा करें..." : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
