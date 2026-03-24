import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    if (!body) throw new ApiError(400, "Invalid JSON body");

    const name = (body.name as string) ?? "";
    const email = (body.email as string) ?? "";
    const password = (body.password as string) ?? "";

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Name is required");
    }
    if (name.trim().length > 120) {
      throw new ApiError(400, "Name cannot exceed 120 characters");
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new ApiError(400, "Email is required");
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new ApiError(400, "Invalid email format");
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      throw new ApiError(400, "Password is required");
    }
    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role: "user",
      membershipStatus: "none",
      membership: { isPaid: false },
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          membershipStatus: user.membershipStatus ?? "none",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "POST /api/auth/register");
  }
}
