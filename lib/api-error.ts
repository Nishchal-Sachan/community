import { NextResponse } from "next/server";

// ─── Custom Error Class ───────────────────────────────────────────────────────

/**
 * Throw this inside any API route for expected, user-facing errors.
 * handleApiError() will convert it to the correct JSON response.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

type MongooseValidationError = {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
};

type MongooseCastError = {
  name: "CastError";
  message: string;
};

function isValidationError(err: unknown): err is MongooseValidationError {
  return (
    err !== null &&
    typeof err === "object" &&
    "name" in err &&
    (err as { name: string }).name === "ValidationError" &&
    "errors" in err
  );
}

function isCastError(err: unknown): err is MongooseCastError {
  return (
    err !== null &&
    typeof err === "object" &&
    "name" in err &&
    (err as { name: string }).name === "CastError"
  );
}

// ─── Central Handler ──────────────────────────────────────────────────────────

/**
 * Call in every route's catch block.
 * Handles ApiError, Mongoose ValidationError, Mongoose CastError,
 * and falls back to 500 for anything unexpected.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (isValidationError(error)) {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (isCastError(error)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  console.error(`[${context}]`, error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely parse the JSON body of a request. Returns null on failure. */
export async function parseBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
