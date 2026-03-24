import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Matrimony from "@/lib/models/Matrimony";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { matrimonyPrimaryImage } from "@/lib/matrimony-profile";
import { handleApiError } from "@/lib/api-error";

// GET /api/matrimony/list — active community members only; contact fields never in list JSON
export async function GET() {
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

    await connectDB();

    const profiles = await Matrimony.find({})
      .sort({ createdAt: -1 })
      .lean();

    const list = profiles.map((p) => {
      const id = String(p._id);
      const createdBy = String(p.createdBy);
      const image = matrimonyPrimaryImage(p);
      const isOwner = viewer.userId === createdBy;

      return {
        id,
        fullName: p.fullName,
        profession: p.profession,
        profilePhotoUrl: image,
        isOwner,
      };
    });

    return NextResponse.json({
      profiles: list,
      marriageSubscriptionActive: viewer.hasMarriageSubscription,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/matrimony/list");
  }
}
