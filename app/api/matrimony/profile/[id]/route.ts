import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Matrimony from "@/lib/models/Matrimony";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { matrimonyGalleryUrls, matrimonyPrimaryImage } from "@/lib/matrimony-profile";
import { ApiError, handleApiError } from "@/lib/api-error";

// GET /api/matrimony/profile/:id — full profile only for marriage subscribers
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getUserFromCookie();
    const viewer = await getMatrimonyViewerContext(payload);

    if (!viewer?.isActiveMember) {
      return NextResponse.json(
        {
          error: "यह सुविधा केवल सदस्यों के लिए उपलब्ध है",
          code: "MEMBERS_ONLY",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid profile ID");
    }

    await connectDB();
    const p = await Matrimony.findById(id).lean();
    if (!p) throw new ApiError(404, "Profile not found");

    const image = matrimonyPrimaryImage(p);

    if (!viewer.hasMarriageSubscription) {
      return NextResponse.json({
        restricted: true,
        profile: {
          id: String(p._id),
          fullName: p.fullName,
          profession: p.profession,
          profilePhotoUrl: image,
        },
      });
    }

    const galleryUrls = matrimonyGalleryUrls(p);

    return NextResponse.json({
      restricted: false,
      profile: {
        id: String(p._id),
        createdBy: String(p.createdBy),
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        galleryUrls,
        profilePhotoUrl: image,
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
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/matrimony/profile/:id");
  }
}
