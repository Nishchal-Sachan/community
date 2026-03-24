import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";

// GET /api/admin/payments?plan=membership|marriage&from=&to=
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { searchParams } = req.nextUrl;
    const plan = searchParams.get("plan");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: Record<string, unknown> = { status: "success" };
    if (plan === "membership" || plan === "marriage") {
      filter.planType = plan;
    }
    if (from || to) {
      const range: { $gte?: Date; $lte?: Date } = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d.getTime())) range.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          range.$lte = d;
        }
      }
      if (Object.keys(range).length) filter.date = range;
    }

    await connectDB();

    const rows = await Payment.find(filter)
      .sort({ date: -1 })
      .limit(500)
      .select("fullName email planType amountPaise paymentId orderId method date")
      .lean();

    return NextResponse.json({
      payments: rows.map((p) => ({
        id: String(p._id),
        fullName: p.fullName,
        email: p.email,
        plan: p.planType === "marriage" ? "Marriage" : "Membership",
        planType: p.planType,
        amountRupees: Math.round(p.amountPaise / 100),
        paymentId: p.paymentId,
        orderId: p.orderId,
        method: p.method,
        date: (p.date as Date).toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/payments");
  }
}
