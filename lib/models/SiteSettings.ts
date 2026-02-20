import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
  heroTitle: string;
  heroImage: string;
}

/**
 * Singleton model — always one document in the collection.
 * Use getSiteSettings() / updateSiteSettings() helpers below
 * instead of querying the model directly.
 */
const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    heroTitle: {
      type: String,
      required: [true, "Hero title is required"],
      trim: true,
      maxlength: [200, "Hero title must be at most 200 characters"],
    },
    heroImage: {
      type: String,
      trim: true,
      default: "",
      match: [/^(https?:\/\/.+)?$/, "Hero image must be a valid HTTP/HTTPS URL"],
    },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS = {
  heroTitle: "Community Leader",
  heroImage: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the single settings document, creating it with defaults if absent. */
export async function getSiteSettings(): Promise<ISiteSettings> {
  const doc = await SiteSettings.findOneAndUpdate(
    {},
    { $setOnInsert: DEFAULTS },
    { upsert: true, new: true, runValidators: true }
  );
  return doc!;
}

/** Partially updates the settings document and returns the updated version. */
export async function updateSiteSettings(
  patch: Partial<Pick<ISiteSettings, "heroTitle" | "heroImage">>
): Promise<ISiteSettings> {
  const doc = await SiteSettings.findOneAndUpdate(
    {},
    { $set: patch },
    { upsert: true, new: true, runValidators: true }
  );
  return doc!;
}
