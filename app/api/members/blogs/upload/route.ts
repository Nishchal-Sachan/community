import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/user-auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { ApiError, handleApiError } from "@/lib/api-error";
import { uploadImageFileToCloudinary } from "@/lib/cloudinary-image-upload";

const BLOG_IMAGE_FOLDER = "blog";

export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    if (!payload?.userId) throw new ApiError(401, "Unauthorized");

    await connectDB();
    const user = await User.findById(payload.userId).lean();
    if (!user || user.role !== "member" || !user.isBlogger) {
      throw new ApiError(403, "Not allowed to upload");
    }

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
      folder: BLOG_IMAGE_FOLDER,
    });

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof Error && !(error instanceof ApiError)) {
      return handleApiError(
        new ApiError(400, error.message),
        "POST /api/members/blogs/upload",
      );
    }
    return handleApiError(error, "POST /api/members/blogs/upload");
  }
}
