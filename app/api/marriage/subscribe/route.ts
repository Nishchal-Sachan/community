import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { handleApiError } from "@/lib/api-error";
import { MARRIAGE_SUBSCRIPTION_AMOUNT_PAISE } from "@/lib/marriage-payment";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

/**
 * POST /api/marriage/subscribe — create Razorpay order for marriage subscription (active members only).
 */
export async function POST() {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
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

    if (viewer.hasMarriageSubscription) {
      return NextResponse.json(
        { error: "Marriage subscription is already active" },
        { status: 400 }
      );
    }

    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await instance.orders.create({
      amount: MARRIAGE_SUBSCRIPTION_AMOUNT_PAISE,
      currency: "INR",
      receipt: `marriage_${payload.userId}_${Date.now()}`,
      notes: {
        userId: payload.userId,
        type: "marriage_subscription",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/marriage/subscribe");
  }
}
