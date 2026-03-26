import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import HelpRequest from "@/lib/models/HelpRequest";
import { ApiError, handleApiError, parseBody } from "@/lib/api-error";

function serializeDetail(doc: {
  _id: unknown;
  name: string;
  phone: string;
  email?: string;
  category: string;
  subCategory: string;
  location: string;
  description: string;
  urgency: string;
  attachmentUrl?: string;
  createdAt?: Date;
  resolved?: boolean;
  resolvedAt?: Date | null;
}) {
  const createdAt = doc.createdAt;
  return {
    id: String(doc._id),
    name: doc.name,
    phone: doc.phone,
    email: doc.email ?? "",
    category: doc.category,
    subCategory: doc.subCategory,
    location: doc.location,
    description: doc.description,
    urgency: doc.urgency,
    attachmentUrl: doc.attachmentUrl ?? "",
    createdAt:
      createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
    resolved: Boolean(doc.resolved),
    resolvedAt: doc.resolvedAt
      ? new Date(doc.resolvedAt).toISOString()
      : null,
  };
}

// GET /api/admin/helpdesk/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    await connectDB();
    const doc = await HelpRequest.findById(id).lean();
    if (!doc) throw new ApiError(404, "Not found");

    return NextResponse.json({ request: serializeDetail(doc) });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/helpdesk/:id");
  }
}

// PATCH /api/admin/helpdesk/:id — { resolved: boolean }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    const body = await parseBody(req);
    const resolved = body?.resolved;
    if (typeof resolved !== "boolean") {
      throw new ApiError(400, "Body must include resolved: boolean");
    }

    await connectDB();
    const doc = await HelpRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          resolved,
          resolvedAt: resolved ? new Date() : null,
        },
      },
      { new: true },
    ).lean();

    if (!doc) throw new ApiError(404, "Not found");

    return NextResponse.json({ request: serializeDetail(doc) });
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/helpdesk/:id");
  }
}

// DELETE /api/admin/helpdesk/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid id");

    await connectDB();
    const result = await HelpRequest.findByIdAndDelete(id);
    if (!result) throw new ApiError(404, "Not found");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/admin/helpdesk/:id");
  }
}
