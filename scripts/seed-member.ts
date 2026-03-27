/**
 * One-time script to seed a pseudo member (paid membership + marriage portal) for testing.
 *
 * Targets: sachannishchal@gmail.com — sets active membership, isPaid, and marriageSubscriptionStatus active.
 *
 * Usage:
 *   npx tsx scripts/seed-member.ts
 *
 * Make sure DATABASE_URL or MONGODB_URI is set in .env or .env.local.
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

const envPaths = [".env", ".env.local"];
envPaths.forEach((envFile) => dotenv.config({ path: path.resolve(process.cwd(), envFile) }));

const MONGODB_URI = process.env.DATABASE_URL ?? process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: DATABASE_URL or MONGODB_URI is not defined in .env or .env.local");
  process.exit(1);
}

// Inline schemas to avoid Next.js module resolution issues when running outside the framework
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "member"] },
    membershipStatus: {
      type: String,
      default: "none",
      enum: ["none", "pending", "active"],
    },
    membership: {
      isPaid: { type: Boolean, default: false },
    },
    marriageSubscriptionStatus: {
      type: String,
      default: "none",
      enum: ["none", "active"],
    },
    isBlogger: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", sparse: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: "" },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    occupation: { type: String, trim: true },
    joinedAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
const Member = mongoose.models.Member ?? mongoose.model("Member", MemberSchema);

async function main() {
  const TARGET_EMAIL = "sachannishchal@gmail.com";
  const MEMBER_NAME = "Nishchal Sachan";
  const MEMBER_PHONE = "+91 1234567890";
  const MEMBER_AREA = "दिल्ली, दिल्ली";
  const MEMBER_CITY = "दिल्ली";
  const MEMBER_STATE = "दिल्ली";

  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error(`ERROR: User with email "${TARGET_EMAIL}" not found. Please register first at /register`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const wasMember = user.role === "member";
  await User.updateOne(
    { email: TARGET_EMAIL },
    {
      $set: {
        role: "member",
        membershipStatus: "active",
        "membership.isPaid": true,
        marriageSubscriptionStatus: "active",
        isBlogger: true,
      },
    }
  );
  console.log(
    `User "${TARGET_EMAIL}" updated: paid member + marriage portal (premium) + Blogger Access active.${wasMember ? " (was already member)" : ""}`
  );

  const memberExists = await Member.findOne({ name: MEMBER_NAME, phone: MEMBER_PHONE });
  if (!memberExists) {
    await Member.create({
      name: MEMBER_NAME,
      fullName: MEMBER_NAME,
      phone: MEMBER_PHONE,
      area: MEMBER_AREA,
      city: MEMBER_CITY,
      state: MEMBER_STATE,
      email: TARGET_EMAIL,
      address: "दिल्ली, दिल्ली, भारत",
      occupation: "परीक्षण",
      userId: user._id,
      isPublic: true,
    });
    console.log("Member directory entry created.");
  } else {
    await Member.updateOne(
      { _id: memberExists._id },
      {
        $set: {
          userId: user._id,
          fullName: MEMBER_NAME,
          name: MEMBER_NAME,
          city: MEMBER_CITY,
          state: MEMBER_STATE,
          email: TARGET_EMAIL,
          address: "दिल्ली, दिल्ली, भारत",
          occupation: "परीक्षण",
        },
      }
    );
    console.log("Member directory entry updated with contact details.");
  }

  console.log("\n--- Paid Member Ready ---");
  console.log(`  Email:       ${TARGET_EMAIL}`);
  console.log("  Password:    (your existing password)");
  console.log("  Permissions: Full Member + Marriage Premium + Blogger");
  console.log("\nLogin and access full member portal & blogging features.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
