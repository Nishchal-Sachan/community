"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PaymentReceiptPreviewModal } from "@/components/payment/PaymentReceiptPreviewModal";
import { PaymentSuccessModal } from "@/components/payment/PaymentSuccessModal";
import type { ClientReceipt } from "@/lib/payment-receipt-types";
import {
  MARRIAGE_SUBSCRIPTION_DISPLAY_RUPEES,
} from "@/lib/marriage-payment";
import { MARRIAGE_PLAN_LABEL_HI } from "@/lib/payment-plans";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

async function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export function MarriageSubscribeButton({
  className = "",
  showFeeHint = true,
}: {
  className?: string;
  showFeeHint?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDateLabel, setPreviewDateLabel] = useState("");
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<ClientReceipt | null>(null);

  useEffect(() => {
    if (!previewOpen) return;
    setPreviewDateLabel(
      new Date().toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    let cancelled = false;
    (async () => {
      setMeLoading(true);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!cancelled && res.ok && data.user) {
          setMe({
            name: String(data.user.name ?? ""),
            email: String(data.user.email ?? ""),
          });
        }
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [previewOpen]);

  const startGateway = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch("/api/marriage/subscribe", {
        method: "POST",
        credentials: "include",
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? "ऑर्डर नहीं बन सका");
      }

      const { orderId, keyId, amount, currency } = orderData;
      if (!orderId || !keyId) {
        throw new Error("अमान्य ऑर्डर प्रतिक्रिया");
      }

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("भुगतान लोड नहीं हो सका");
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency: currency ?? "INR",
        name: "Akhil Bhartiya Kushwaha Mahasabha",
        description: "विवाह सदस्यता शुल्क",
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response: RazorpayResponse) => {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/marriage/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(
                typeof verifyData.error === "string"
                  ? verifyData.error
                  : "भुगतान सत्यापन विफल"
              );
            }

            setPreviewOpen(false);
            if (verifyData.receipt) {
              setSuccessReceipt(verifyData.receipt as ClientReceipt);
            } else {
              router.refresh();
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "सत्यापन विफल");
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "कुछ गलत हुआ");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-2">
      <PaymentReceiptPreviewModal
        open={previewOpen}
        onClose={() => !loading && setPreviewOpen(false)}
        fullName={me?.name ?? ""}
        email={me?.email ?? ""}
        planLabelHi={MARRIAGE_PLAN_LABEL_HI}
        amountRupees={MARRIAGE_SUBSCRIPTION_DISPLAY_RUPEES}
        previewDateLabel={previewDateLabel}
        onContinue={() => {
          if (meLoading) return;
          void startGateway();
        }}
        continueLoading={loading || meLoading}
      />

      <PaymentSuccessModal
        open={Boolean(successReceipt)}
        receipt={successReceipt}
        onDone={() => {
          setSuccessReceipt(null);
          router.refresh();
        }}
        doneLabel="बंद करें"
      />

      {showFeeHint && (
        <p className="font-body text-sm text-gray-600">
          विवाह सदस्यता शुल्क: ₹{MARRIAGE_SUBSCRIPTION_DISPLAY_RUPEES}
        </p>
      )}
      {error && (
        <p className="font-body text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        disabled={loading}
        className={
          className ||
          "inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
        }
      >
        {loading ? "खुल रहा है..." : "विवाह सदस्यता प्राप्त करें"}
      </button>
    </div>
  );
}
