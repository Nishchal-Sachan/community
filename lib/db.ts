import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = (process.env.DATABASE_URL ?? process.env.MONGODB_URI)?.trim();
  if (!uri) {
    throw new Error(
      "DATABASE_URL or MONGODB_URI is not set. Add it to .env or .env.local in the project root (see .env.example)."
    );
  }
  return uri;
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
    const uri = getMongoUri();
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
