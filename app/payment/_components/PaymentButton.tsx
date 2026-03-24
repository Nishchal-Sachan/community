"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { PaymentReceiptPreviewModal } from "@/components/payment/PaymentReceiptPreviewModal";
import { PaymentSuccessModal } from "@/components/payment/PaymentSuccessModal";
import type { ClientReceipt } from "@/lib/payment-receipt-types";
import {
  MEMBERSHIP_DISPLAY_RUPEES,
  MEMBERSHIP_PLAN_LABEL_HI,
} from "@/lib/payment-plans";

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

export function PaymentButton() {
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
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        credentials: "include",
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? "Failed to create order");
      }

      const { orderId, keyId, amount, currency } = orderData;
      if (!orderId || !keyId) {
        throw new Error("Invalid order response");
      }

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to load");
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency: currency ?? "INR",
        name: "Akhil Bhartiya Kushwaha Mahasabha",
        description: "सदस्यता शुल्क",
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response: RazorpayResponse) => {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/payment/verify", {
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
              throw new Error(verifyData.error ?? "Payment verification failed");
            }

            setPreviewOpen(false);
            if (verifyData.receipt) {
              setSuccessReceipt(verifyData.receipt as ClientReceipt);
            } else {
              router.push("/members");
              router.refresh();
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed");
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="mt-8">
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <PaymentReceiptPreviewModal
        open={previewOpen}
        onClose={() => !loading && setPreviewOpen(false)}
        fullName={me?.name ?? ""}
        email={me?.email ?? ""}
        planLabelHi={MEMBERSHIP_PLAN_LABEL_HI}
        amountRupees={MEMBERSHIP_DISPLAY_RUPEES}
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
          router.push("/members");
          router.refresh();
        }}
        doneLabel="सदस्य पोर्टल पर जाएं"
      />

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        disabled={loading}
        className="w-full rounded-md bg-[#F57C00] px-6 py-4 font-body text-lg font-semibold text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
      >
        {loading ? "खुल रहा है..." : "सदस्य बनें"}
      </button>
      <p className="mt-2 text-center font-body text-sm text-gray-600">
        सदस्यता शुल्क: ₹{MEMBERSHIP_DISPLAY_RUPEES}
      </p>
    </div>
  );
}
