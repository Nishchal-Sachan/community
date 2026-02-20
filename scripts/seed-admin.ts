/**
 * One-time script to seed the initial admin user.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Make sure MONGODB_URI is set in .env.local before running.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined in .env.local");
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
  // --- Configure these before running ---
  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "ChangeMe123!";
  // --------------------------------------

  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const exists = await Admin.findOne({ email: ADMIN_EMAIL });
  if (exists) {
    console.log(`Admin with email "${ADMIN_EMAIL}" already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({ email: ADMIN_EMAIL, password: hashedPassword });

  console.log(`Admin created successfully:`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("\nIMPORTANT: Change the password after first login.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
