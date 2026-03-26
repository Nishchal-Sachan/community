import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Upload a browser File to Cloudinary; returns `secure_url` for storing in DB (e.g. `coverImage`).
 */
export async function uploadImageFileToCloudinary(
  file: File,
  options: { folder: string },
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large (max 5MB)");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
    resource_type: "image",
    overwrite: false,
  });

  if (!result.secure_url) {
    throw new Error("Upload failed");
  }

  return result.secure_url;
}
