import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Member from "@/lib/models/Member";
import Payment from "@/lib/models/Payment";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";

// GET /api/admin/dashboard
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    await connectDB();

    const [totalMembers, activeMembers, totalPayments, recentRaw] = await Promise.all([
      Member.countDocuments(),
      User.countDocuments({ membershipStatus: "active" }),
      Payment.countDocuments({ status: "success" }),
      Payment.find({ status: "success" })
        .sort({ date: -1 })
        .limit(10)
        .select("fullName planType amountPaise paymentId orderId method date")
        .lean(),
    ]);

    const recentTransactions = recentRaw.map((p) => ({
      id: String(p._id),
      fullName: p.fullName,
      plan: p.planType === "marriage" ? "Marriage" : "Membership",
      amountRupees: Math.round(p.amountPaise / 100),
      paymentId: p.paymentId,
      orderId: p.orderId,
      method: p.method,
      date: (p.date as Date).toISOString(),
    }));

    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalPayments,
      recentTransactions,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/dashboard");
  }
}
