import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { parseBody } from "@/lib/api-error";
import { MARRIAGE_SUBSCRIPTION_AMOUNT_PAISE } from "@/lib/marriage-payment";
import { MARRIAGE_PLAN_LABEL_HI } from "@/lib/payment-plans";
import { recordVerifiedPayment } from "@/lib/record-verified-payment";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!RAZORPAY_SECRET) return false;
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

/**
 * POST /api/marriage/verify — verify Razorpay payment and set marriageSubscriptionStatus = active.
 */
export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_SECRET || !RAZORPAY_KEY_ID) {
      return NextResponse.json(
        { error: "Payment configuration missing" },
        { status: 500 }
      );
    }

    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viewer = await getMatrimonyViewerContext(payload);
    if (!viewer?.isActiveMember) {
      return NextResponse.json(
        { error: "Active membership required" },
        { status: 403 }
      );
    }

    const body = await parseBody(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const razorpayOrderId = body.razorpay_order_id as string;
    const razorpayPaymentId = body.razorpay_payment_id as string;
    const razorpaySignature = body.razorpay_signature as string;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    if (
      !verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.fetch(razorpayOrderId);
    const amount = typeof order.amount === "number" ? order.amount : Number(order.amount);
    if (amount !== MARRIAGE_SUBSCRIPTION_AMOUNT_PAISE) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const notes = order.notes as Record<string, string> | undefined;
    if (notes?.type !== "marriage_subscription") {
      return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
    }
    if (notes?.userId !== payload.userId) {
      return NextResponse.json({ error: "Order does not match this user" }, { status: 403 });
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $set: { marriageSubscriptionStatus: "active" } },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paymentEntity = (await razorpay.payments.fetch(
      razorpayPaymentId
    )) as { method?: string; order_id?: string };
    if (
      paymentEntity.order_id &&
      paymentEntity.order_id !== razorpayOrderId
    ) {
      return NextResponse.json(
        { error: "Payment does not match order" },
        { status: 400 }
      );
    }

    const { receipt } = await recordVerifiedPayment({
      userId: user._id.toString(),
      fullName: (user.name ?? "").trim() || "सदस्य",
      email: user.email,
      planType: "marriage",
      planLabelHi: MARRIAGE_PLAN_LABEL_HI,
      amountPaise: MARRIAGE_SUBSCRIPTION_AMOUNT_PAISE,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      methodRaw: paymentEntity.method,
    });

    return NextResponse.json({
      success: true,
      message: "Marriage subscription activated.",
      marriageSubscriptionStatus: "active",
      receipt,
    });
  } catch (error) {
    console.error("[marriage verify]", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
