import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";
import { uploadImageFileToCloudinary } from "@/lib/cloudinary-image-upload";

// POST /api/admin/upload — admin only, returns secure URL (general site assets)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new ApiError(500, "Image upload is not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      throw new ApiError(400, "No file provided");
    }

    const url = await uploadImageFileToCloudinary(file, {
      folder: "site-content",
    });

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof Error && !(error instanceof ApiError)) {
      return handleApiError(
        new ApiError(400, error.message),
        "POST /api/admin/upload",
      );
    }
    return handleApiError(error, "POST /api/admin/upload");
  }
}
