import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/api-error";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// POST /api/admin/upload — admin only, returns secure URL
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new ApiError(500, "Image upload is not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      throw new ApiError(400, "No file provided");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, "Invalid file type");
    }
    if (file.size > MAX_SIZE) {
      throw new ApiError(400, "File too large (max 5MB)");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "site-content",
      resource_type: "image",
      overwrite: false,
    });

    if (!result.secure_url) {
      throw new ApiError(500, "Upload failed");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/upload");
  }
}
