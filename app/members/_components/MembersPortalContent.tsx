"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { JoinMembershipForm } from "@/app/join/_components/JoinMembershipForm";

interface MembersPortalContentProps {
  isMember: boolean;
}

export function MembersPortalContent({ isMember }: MembersPortalContentProps) {
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!showForm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showForm]);

  if (isMember) {
    return null;
  }

  const modalContent = showForm && (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={() => setShowForm(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-form-title"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Sticky header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 id="membership-form-title" className="font-heading text-xl font-semibold text-gray-900">
                सदस्यता आवेदन फॉर्म
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="बंद करें"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-6 py-5">
                <p className="mb-6 font-body text-sm text-gray-600">
                  समाज का हिस्सा बनने के लिए सदस्यता लें। फॉर्म भरकर भुगतान चरण पर जाएं।
                </p>
                <JoinMembershipForm
                  formId="membership-form"
                  submitInFooter
                  onSuccess={() => setShowForm(false)}
                  onLoadingChange={setFormLoading}
                />
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="submit"
                form="membership-form"
                disabled={formLoading}
                className="w-full rounded-lg bg-[#F57C00] py-3.5 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {formLoading ? "सेव हो रहा है..." : "आवेदन जमा करें"}
              </button>
            </div>
          </div>
        </div>
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="font-body text-sm text-gray-600">
          समाज का हिस्सा बनने के लिए सदस्यता लें
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F57C00] bg-[#F57C00] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            सदस्य बनें
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            अभी आवेदन करें
          </button>
        </div>
      </div>

      {showForm && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
