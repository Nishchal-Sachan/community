import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { sendHelpdeskMail } from "@/lib/helpdesk-mail";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import {
  isValidHelpdeskCategory,
  isValidSubCategory,
  type HelpdeskCategory,
} from "@/lib/helpdesk-categories";
import HelpRequest from "@/lib/models/HelpRequest";
import { isHelpdeskMailConfigured } from "@/services/emailService";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length >= 10) return digits.slice(-10);
  return raw.trim().slice(0, 20);
}

function validatePhone(raw: string): boolean {
  const n = normalizePhone(raw);
  return /^[6-9]\d{9}$/.test(n);
}

async function uploadToCloudinary(mimeType: string, base64Payload: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new ApiError(
      503,
      "संलग्नक अपलोड इस समय उपलब्ध नहीं है। कृपया बिना फ़ाइल के भेजें या बाद में पुनः प्रयास करें।",
    );
  }
  if (!ALLOWED_FILE_TYPES.includes(mimeType as (typeof ALLOWED_FILE_TYPES)[number])) {
    throw new ApiError(400, "केवल PDF, JPEG, PNG या WebP अनुमत हैं।");
  }

  const buffer = Buffer.from(base64Payload, "base64");
  if (buffer.length > MAX_FILE_SIZE) {
    throw new ApiError(400, "फ़ाइल अधिकतम 10MB तक हो सकती है।");
  }

  const dataUri = `data:${mimeType};base64,${base64Payload}`;
  const isPdf = mimeType === "application/pdf";

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "helpdesk",
    resource_type: isPdf ? "raw" : "auto",
    overwrite: false,
  });

  if (!result.secure_url) {
    throw new ApiError(500, "अपलोड विफल।");
  }
  return result.secure_url;
}

type JsonBody = {
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  category?: unknown;
  subCategory?: unknown;
  location?: unknown;
  description?: unknown;
  urgency?: unknown;
  attachmentBase64?: unknown;
  attachmentMimeType?: unknown;
  attachmentFileName?: unknown;
};

// POST /api/helpdesk — JSON body (+ optional base64 attachment); notifies admin via Gmail (nodemailer)
export async function POST(req: NextRequest) {
  try {
    if (!isHelpdeskMailConfigured()) {
      throw new ApiError(
        503,
        "ईमेल सेवा कॉन्फ़िगर नहीं है। कृपया बाद में पुनः प्रयास करें।",
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(415, "Content-Type must be application/json");
    }

    let body: JsonBody;
    try {
      body = (await req.json()) as JsonBody;
    } catch {
      throw new ApiError(400, "अमान्य JSON");
    }

    const fullName = String(body.fullName ?? "").trim();
    const phoneRaw = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const category = String(body.category ?? "").trim();
    const subCategory = String(body.subCategory ?? "").trim();
    const location = String(body.location ?? "").trim();
    const description = String(body.description ?? "").trim();
    const urgencyRaw = String(body.urgency ?? "medium").trim().toLowerCase();

    if (!fullName) throw new ApiError(400, "पूरा नाम आवश्यक है।");
    if (!phoneRaw) throw new ApiError(400, "फ़ोन नंबर आवश्यक है।");
    if (!validatePhone(phoneRaw)) {
      throw new ApiError(400, "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।");
    }
    if (email && !EMAIL_REGEX.test(email)) {
      throw new ApiError(400, "मान्य ईमेल दर्ज करें।");
    }
    if (!isValidHelpdeskCategory(category)) {
      throw new ApiError(400, "श्रेणी चुनें।");
    }
    const cat = category as HelpdeskCategory;
    if (!subCategory || !isValidSubCategory(cat, subCategory)) {
      throw new ApiError(400, "उप-श्रेणी चुनें।");
    }
    if (!location) throw new ApiError(400, "स्थान (शहर / ज़िला) आवश्यक है।");
    if (description.length < 10) {
      throw new ApiError(400, "विवरण कम से कम 10 अक्षरों का हो।");
    }
    if (description.length > 5000) {
      throw new ApiError(400, "विवरण बहुत लंबा है।");
    }

    let urgency: string = "medium";
    if (urgencyRaw === "low" || urgencyRaw === "medium" || urgencyRaw === "high") {
      urgency = urgencyRaw;
    }

    const attB64 =
      typeof body.attachmentBase64 === "string" ? body.attachmentBase64.trim() : "";
    const attMime =
      typeof body.attachmentMimeType === "string"
        ? body.attachmentMimeType.trim()
        : "";
    let attachmentUrl = "";
    if (attB64.length > 0) {
      if (!attMime) {
        throw new ApiError(400, "संलग्नक के लिए MIME प्रकार आवश्यक है।");
      }
      const raw = attB64.includes(",") ? attB64.split(",").pop() ?? attB64 : attB64;
      attachmentUrl = await uploadToCloudinary(attMime, raw);
    }

    const payload = {
      name: fullName.slice(0, 120),
      phone: normalizePhone(phoneRaw),
      email: email ? email.slice(0, 120) : "",
      category: cat,
      subCategory: subCategory.slice(0, 80),
      location: location.slice(0, 120),
      description: description.slice(0, 5000),
      urgency,
      attachmentUrl,
    };

    await connectDB();
    await HelpRequest.create(payload);

    await sendHelpdeskMail({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      category: payload.category,
      subCategory: payload.subCategory,
      location: payload.location,
      description: payload.description,
      urgency: payload.urgency,
      attachmentUrl: attachmentUrl || undefined,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    return handleApiError(error, "POST /api/helpdesk");
  }
}
