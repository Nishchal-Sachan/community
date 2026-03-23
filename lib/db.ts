import mongoose from "mongoose";

const MONGODB_URI = (process.env.DATABASE_URL ?? process.env.MONGODB_URI) as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define DATABASE_URL (or legacy MONGODB_URI) in .env.local — see .env.example"
  );
}

/**
 * Cached connection to avoid creating a new connection on every hot reload
 * in Next.js development mode.
 */
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

const cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
