/**
 * Seeds the admin user: deletes all documents in the `admins` collection, then
 * creates one account (see credentials in `main()`).
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Make sure DATABASE_URL or MONGODB_URI is set in .env or .env.local.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

const envPaths = [".env", ".env.local"];
envPaths.forEach((envFile) => dotenv.config({ path: path.resolve(process.cwd(), envFile) }));

const MONGODB_URI = process.env.DATABASE_URL ?? process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: DATABASE_URL or MONGODB_URI is not defined in .env or .env.local");
  process.exit(1);
}

// Inline schema to avoid Next.js module resolution issues when running outside the framework
const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);

async function main() {
  const ADMIN_EMAIL = "sachannishchal@gmail.com";
  const ADMIN_PASSWORD = "Nishchal@admin123";

  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const removed = await Admin.deleteMany({});
  console.log(`Removed ${removed.deletedCount} existing admin account(s).`);

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({ email: ADMIN_EMAIL.toLowerCase().trim(), password: hashedPassword });

  console.log("Admin created successfully:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
