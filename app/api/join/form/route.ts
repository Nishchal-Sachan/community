import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/user-auth";
import { handleApiError } from "@/lib/api-error";

const JOIN_FORM_COOKIE = "join_form_data";
const COOKIE_MAX_AGE = 60 * 15; // 15 minutes

interface JoinFormData {
  fullName: string;
  phone: string;
  city: string;
  state: string;
  occupation: string;
}

function validateForm(body: unknown): JoinFormData {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const fullName = String(b.fullName ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const city = String(b.city ?? "").trim();
  const state = String(b.state ?? "").trim();
  const occupation = String(b.occupation ?? "").trim();

  if (!fullName) throw new Error("Full name is required");
  if (!phone) throw new Error("Phone number is required");
  if (!city) throw new Error("City is required");
  if (!state) throw new Error("State is required");
  if (!occupation) throw new Error("Occupation is required");

  return { fullName, phone, city, state, occupation };
}

// POST /api/join/form
export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = validateForm(body);

    const response = NextResponse.json(
      { message: "Form saved", redirect: "/payment" },
      { status: 200 }
    );

    response.cookies.set(JOIN_FORM_COOKIE, JSON.stringify(data), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid form data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
