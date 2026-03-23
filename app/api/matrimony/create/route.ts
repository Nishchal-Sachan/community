import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Matrimony from "@/lib/models/Matrimony";
import { getUserFromCookie } from "@/lib/user-auth";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";
import { MATRIMONY_MAX_LENGTHS } from "@/lib/models/Matrimony";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function sanitizeString(val: unknown, maxLen: number): string {
  return String(val ?? "")
    .trim()
    .slice(0, maxLen);
}

function validateCreateBody(body: unknown): {
  fullName: string;
  age: number;
  gender: "male" | "female";
  profilePhotoUrl: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const b = body as Record<string, unknown>;
  const gender = b.gender === "male" || b.gender === "female" ? b.gender : null;
  const fullName = sanitizeString(b.fullName, MATRIMONY_MAX_LENGTHS.fullName);
  const ageRaw = typeof b.age === "number" ? b.age : parseInt(String(b.age ?? ""), 10);
  const age = Number.isInteger(ageRaw) && ageRaw >= 18 && ageRaw <= 120 ? ageRaw : NaN;
  const profilePhotoUrl = sanitizeString(b.profilePhotoUrl, MATRIMONY_MAX_LENGTHS.profilePhotoUrl);
  const height = sanitizeString(b.height, MATRIMONY_MAX_LENGTHS.height);
  const maritalStatus = sanitizeString(b.maritalStatus, MATRIMONY_MAX_LENGTHS.maritalStatus);
  const religion = sanitizeString(b.religion, MATRIMONY_MAX_LENGTHS.religion);
  const caste = sanitizeString(b.caste, MATRIMONY_MAX_LENGTHS.caste);
  const education = sanitizeString(b.education, MATRIMONY_MAX_LENGTHS.education);
  const profession = sanitizeString(b.profession, MATRIMONY_MAX_LENGTHS.profession);
  const income = sanitizeString(b.income, MATRIMONY_MAX_LENGTHS.income);
  const location = sanitizeString(b.location, MATRIMONY_MAX_LENGTHS.location);
  const about = sanitizeString(b.about, MATRIMONY_MAX_LENGTHS.about);
  const contactName = sanitizeString(b.contactName, MATRIMONY_MAX_LENGTHS.contactName);
  const contactPhone = sanitizeString(b.contactPhone, MATRIMONY_MAX_LENGTHS.contactPhone);
  const contactEmail = sanitizeString(b.contactEmail, MATRIMONY_MAX_LENGTHS.contactEmail).toLowerCase();

  if (!gender) throw new ApiError(400, "Gender must be 'male' or 'female'");
  if (!fullName) throw new ApiError(400, "Full name is required");
  if (!Number.isFinite(age)) throw new ApiError(400, "Valid age (18–120) is required");
  if (!height) throw new ApiError(400, "Height is required");
  if (!maritalStatus) throw new ApiError(400, "Marital status is required");
  if (!religion) throw new ApiError(400, "Religion is required");
  if (!caste) throw new ApiError(400, "Caste is required");
  if (!education) throw new ApiError(400, "Education is required");
  if (!profession) throw new ApiError(400, "Profession is required");
  if (!income) throw new ApiError(400, "Income is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!about) throw new ApiError(400, "About is required");
  if (!contactName) throw new ApiError(400, "Contact name is required");
  if (!contactPhone) throw new ApiError(400, "Contact phone is required");
  if (!contactEmail) throw new ApiError(400, "Contact email is required");
  if (!EMAIL_REGEX.test(contactEmail)) throw new ApiError(400, "Invalid contact email format");

  return {
    fullName,
    age,
    gender,
    profilePhotoUrl,
    height,
    maritalStatus,
    religion,
    caste,
    education,
    profession,
    income,
    location,
    about,
    contactName,
    contactPhone,
    contactEmail,
  };
}

// POST /api/matrimony/create — logged-in users only
export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseBody(req);
    const data = validateCreateBody(body);

    await connectDB();

    const profile = await Matrimony.create({
      ...data,
      createdBy: payload.userId,
    });

    return NextResponse.json(
      {
        message: "Profile created successfully",
        profile: {
          id: profile._id.toString(),
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          profilePhotoUrl: profile.profilePhotoUrl,
          height: profile.height,
          maritalStatus: profile.maritalStatus,
          religion: profile.religion,
          caste: profile.caste,
          education: profile.education,
          profession: profile.profession,
          income: profile.income,
          location: profile.location,
          about: profile.about,
          contactName: profile.contactName,
          contactPhone: profile.contactPhone,
          contactEmail: profile.contactEmail,
          createdAt: profile.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "POST /api/matrimony/create");
  }
}
