import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import type { ClientReceipt, PaymentPlanType } from "@/lib/payment-receipt-types";
import {
  MEMBERSHIP_PLAN_LABEL_HI,
  MARRIAGE_PLAN_LABEL_HI,
} from "@/lib/payment-plans";
import { mapRazorpayMethod } from "@/lib/razorpay-payment-method";
import { sendPaymentReceiptEmail } from "@/lib/send-payment-receipt-email";
import type { ReceiptEmailFields } from "@/lib/payment-receipt-html";

function planLabelForType(planType: PaymentPlanType): string {
  return planType === "membership" ? MEMBERSHIP_PLAN_LABEL_HI : MARRIAGE_PLAN_LABEL_HI;
}

function toEmailFields(
  fullName: string,
  planLabelHi: string,
  amountPaise: number,
  paymentId: string,
  orderId: string,
  method: string,
  date: Date
): ReceiptEmailFields {
  return {
    fullName,
    planLabelHi,
    amountRupees: Math.round(amountPaise / 100),
    paymentId,
    orderId,
    method,
    dateFormatted: date.toLocaleString("hi-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

function toClientReceipt(
  fullName: string,
  planType: PaymentPlanType,
  planLabelHi: string,
  amountPaise: number,
  paymentId: string,
  orderId: string,
  method: string,
  date: Date
): ClientReceipt {
  return {
    fullName,
    plan: planLabelHi,
    planType,
    amountRupees: Math.round(amountPaise / 100),
    paymentId,
    orderId,
    method,
    date: date.toISOString(),
  };
}

/**
 * Persist a verified Razorpay payment and email receipt (idempotent by paymentId).
 */
export async function recordVerifiedPayment(opts: {
  userId: string;
  fullName: string;
  email: string;
  planType: PaymentPlanType;
  planLabelHi: string;
  amountPaise: number;
  orderId: string;
  paymentId: string;
  methodRaw: string | undefined;
}): Promise<{ receipt: ClientReceipt }> {
  await connectDB();

  const method = mapRazorpayMethod(opts.methodRaw);
  const paidAt = new Date();

  const existing = await Payment.findOne({ paymentId: opts.paymentId }).lean();
  if (existing) {
    const p = existing as {
      fullName: string;
      email: string;
      planType: PaymentPlanType;
      amountPaise: number;
      paymentId: string;
      orderId: string;
      method: string;
      date: Date;
    };
    const label = planLabelForType(p.planType);
    return {
      receipt: toClientReceipt(
        p.fullName,
        p.planType,
        label,
        p.amountPaise,
        p.paymentId,
        p.orderId,
        p.method,
        new Date(p.date)
      ),
    };
  }

  await Payment.create({
    userId: opts.userId,
    fullName: opts.fullName.slice(0, 120),
    email: opts.email.toLowerCase().slice(0, 320),
    planType: opts.planType,
    amountPaise: opts.amountPaise,
    paymentId: opts.paymentId,
    orderId: opts.orderId,
    method,
    status: "success",
    date: paidAt,
  });

  const receipt = toClientReceipt(
    opts.fullName,
    opts.planType,
    opts.planLabelHi,
    opts.amountPaise,
    opts.paymentId,
    opts.orderId,
    method,
    paidAt
  );

  const emailFields = toEmailFields(
    opts.fullName,
    opts.planLabelHi,
    opts.amountPaise,
    opts.paymentId,
    opts.orderId,
    method,
    paidAt
  );

  try {
    console.log("Sending payment email to:", opts.email);
    await sendPaymentReceiptEmail(opts.email.toLowerCase(), emailFields);
  } catch (e) {
    console.error("[record-verified-payment] email failed", e);
  }

  return { receipt };
}
