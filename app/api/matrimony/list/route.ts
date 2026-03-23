import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Matrimony from "@/lib/models/Matrimony";
import { handleApiError } from "@/lib/api-error";

// GET /api/matrimony/list — return all profiles, sort latest first
export async function GET() {
  try {
    await connectDB();

    const profiles = await Matrimony.find({})
      .sort({ createdAt: -1 })
      .lean();

    const list = profiles.map((p) => ({
      id: (p._id as { toString(): string }).toString(),
      createdBy: (p.createdBy as { toString(): string }).toString(),
      fullName: p.fullName,
      age: p.age,
      gender: p.gender,
      profilePhotoUrl: p.profilePhotoUrl,
      height: p.height,
      maritalStatus: p.maritalStatus,
      religion: p.religion,
      caste: p.caste,
      education: p.education,
      profession: p.profession,
      income: p.income,
      location: p.location,
      about: p.about,
      contactName: p.contactName,
      contactPhone: p.contactPhone,
      contactEmail: p.contactEmail,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ profiles: list });
  } catch (error) {
    return handleApiError(error, "GET /api/matrimony/list");
  }
}
