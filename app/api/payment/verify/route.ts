import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import {
  getUserFromCookie,
  signUserToken,
  getUserCookieOptions,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";
import { parseBody } from "@/lib/api-error";

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

// POST /api/payment/verify
export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_SECRET) {
      return NextResponse.json(
        { error: "Payment configuration missing" },
        { status: 500 }
      );
    }

    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
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

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        role: "member",
        "membership.isPaid": true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = signUserToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Payment verified. Membership activated.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
      },
    });

    response.cookies.set(USER_COOKIE_NAME, token, getUserCookieOptions());

    return response;
  } catch (error) {
    console.error("[verify-payment]", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
