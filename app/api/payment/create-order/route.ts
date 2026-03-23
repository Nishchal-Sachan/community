import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getUserFromCookie } from "@/lib/user-auth";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

const MEMBERSHIP_AMOUNT_PAISE = 1000; // ₹10 in paise

// POST /api/payment/create-order
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

    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const order = await instance.orders.create({
      amount: MEMBERSHIP_AMOUNT_PAISE,
      currency: "INR",
      receipt: `mem_${payload.userId}_${Date.now()}`,
      notes: {
        userId: payload.userId,
        type: "membership",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[create-order]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
