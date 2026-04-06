import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Member from "@/lib/models/Member";
import {
  getUserFromCookie,
  signUserToken,
  getUserCookieOptions,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";
import { parseBody } from "@/lib/api-error";
import { normalizeIndiaState } from "@/lib/india-states";
import { MEMBERSHIP_AMOUNT_PAISE, MEMBERSHIP_PLAN_LABEL_HI } from "@/lib/payment-plans";
import { recordVerifiedPayment } from "@/lib/record-verified-payment";

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const JOIN_FORM_COOKIE = "join_form_data";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function parseJoinFormCookie(req: NextRequest): {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  occupation: string;
  email: string;
} | null {
  const raw = req.cookies.get(JOIN_FORM_COOKIE)?.value;
  if (!raw) return null;
  try {
    const b = JSON.parse(raw) as Record<string, unknown>;
    const fullName = String(b.fullName ?? "").trim();
    const phone = String(b.phone ?? "").trim();
    const city = String(b.city ?? "").trim();
    const state = String(b.state ?? "").trim();
    const occupation = String(b.occupation ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!fullName || !phone || !city || !state) return null;
    return { fullName, phone, city, state, occupation, email };
  } catch {
    return null;
  }
}

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
    const orderAmount =
      typeof order.amount === "number" ? order.amount : Number(order.amount);
    if (orderAmount !== MEMBERSHIP_AMOUNT_PAISE) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const orderNotes = order.notes as Record<string, string> | undefined;
    if (orderNotes?.type !== "membership") {
      return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
    }
    if (orderNotes?.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Order does not match this user" },
        { status: 403 }
      );
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

    await connectDB();

    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        role: "member",
        membershipStatus: "active",
        "membership.isPaid": true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const joinData = parseJoinFormCookie(req);
    if (joinData) {
      try {
        const stateStored =
          normalizeIndiaState(joinData.state) ?? joinData.state.trim().slice(0, 80);
        const areaRaw = `${joinData.city}, ${stateStored}`.trim();
        const area =
          areaRaw.length >= 2
            ? areaRaw.slice(0, 100)
            : joinData.city.slice(0, 100) || stateStored.slice(0, 100);
        const phone = joinData.phone.trim().slice(0, 20);
        const fn = joinData.fullName.trim().slice(0, 100);
        const email =
          joinData.email && EMAIL_REGEX.test(joinData.email)
            ? joinData.email.slice(0, 320)
            : user.email;

        let doc = await Member.findOne({ userId: user._id });
        if (!doc) {
          doc = await Member.findOne({ phone });
        }
        const memberPayload = {
          userId: user._id,
          fullName: fn,
          name: fn,
          phone,
          area,
          city: joinData.city.trim().slice(0, 80),
          state: stateStored,
          email,
          ...(joinData.occupation.trim()
            ? { occupation: joinData.occupation.trim().slice(0, 120) }
            : {}),
          isPublic: true,
        };
        if (doc) {
          await Member.updateOne({ _id: doc._id }, { $set: memberPayload });
        } else {
          await Member.create(memberPayload);
        }
      } catch (e) {
        console.error("[payment verify] member directory sync", e);
      }
    }

    const { receipt } = await recordVerifiedPayment({
      userId: user._id.toString(),
      fullName: (user.name ?? "").trim() || "सदस्य",
      email: user.email,
      planType: "membership",
      planLabelHi: MEMBERSHIP_PLAN_LABEL_HI,
      amountPaise: MEMBERSHIP_AMOUNT_PAISE,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      methodRaw: paymentEntity.method,
    });

    const token = await signUserToken({
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
      receipt,
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
