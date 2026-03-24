import mongoose, { Document, Model, Schema } from "mongoose";

export type SiteSectionKey =
  | "hero"
  | "cta"
  | "leadership"
  | "services"
  | "home_images"
  | "gallery";

export interface ISiteContent extends Document {
  section: SiteSectionKey;
  data: Record<string, unknown>;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    section: {
      type: String,
      required: true,
      enum: ["hero", "cta", "leadership", "services", "home_images", "gallery"],
      unique: true,
    },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true }
);

const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent ??
  mongoose.model<ISiteContent>("SiteContent", SiteContentSchema);

export default SiteContent;
