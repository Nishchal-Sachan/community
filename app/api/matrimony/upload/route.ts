import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/user-auth";
import { ApiError, handleApiError } from "@/lib/api-error";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/matrimony/upload — upload profile photo to Cloudinary, logged-in users only
export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new ApiError(500, "Image upload is not configured. Please set Cloudinary environment variables.");
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file || !(file instanceof File)) {
      throw new ApiError(400, "No photo file provided");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, "Invalid file type. Use JPEG, PNG, or WebP");
    }
    if (file.size > MAX_SIZE) {
      throw new ApiError(400, "File too large. Maximum 5MB");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "matrimony",
      resource_type: "image",
      overwrite: false,
    });

    if (!result.secure_url) {
      throw new ApiError(500, "Upload failed. No URL returned.");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    return handleApiError(error, "POST /api/matrimony/upload");
  }
}
