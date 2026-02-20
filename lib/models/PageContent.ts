import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInitiative {
  title: string;
  description: string;
  icon: string;
}

export interface IPageContent extends Document {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage: string;
  };
  about: {
    bio: string;
    leaderImage: string;
  };
  initiatives: IInitiative[];
}

const InitiativeSchema = new Schema<IInitiative>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    icon: { type: String, required: true, trim: true, maxlength: 50 },
  },
  { _id: false }
);

const PageContentSchema = new Schema<IPageContent>(
  {
    hero: {
      title: { type: String, required: true, trim: true, maxlength: 200 },
      subtitle: { type: String, required: true, trim: true, maxlength: 300 },
      ctaText: { type: String, required: true, trim: true, maxlength: 100 },
      backgroundImage: { type: String, required: true, trim: true },
    },
    about: {
      bio: { type: String, required: true, trim: true },
      leaderImage: { type: String, required: true, trim: true },
    },
    initiatives: {
      type: [InitiativeSchema],
      required: true,
      validate: {
        validator: (v: IInitiative[]) => Array.isArray(v) && v.length >= 1 && v.length <= 12,
        message: "Initiatives must have 1–12 items",
      },
    },
  },
  { timestamps: true }
);

const PageContent: Model<IPageContent> =
  mongoose.models.PageContent ??
  mongoose.model<IPageContent>("PageContent", PageContentSchema);

export default PageContent;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_CONTENT: Omit<IPageContent, keyof Document> = {
  hero: {
    title: "Sarah Martinez",
    subtitle: "Serving the Community with Integrity and Vision",
    ctaText: "Join Community",
    backgroundImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
  },
  about: {
    bio: "For over twelve years, I have had the privilege of serving our community—first as a school board member, then as a city council representative. My work has centered on education reform, infrastructure upgrades, and youth empowerment programs that give every child a fair start. I believe that strong schools, safe streets, and well-maintained public spaces are the foundation of a thriving neighborhood.\n\nTransparency and accountability are non-negotiable. Every decision I make is informed by resident input, public data, and a commitment to doing what is right for the long term—not just what is convenient. I invite you to hold me to that standard.",
    leaderImage:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop",
  },
  initiatives: [
    {
      title: "Youth Development Programs",
      description: "Supporting skill-building workshops and mentorship initiatives.",
      icon: "academic",
    },
    {
      title: "Women Empowerment",
      description: "Promoting entrepreneurship and financial literacy programs.",
      icon: "users",
    },
    {
      title: "Infrastructure Improvement",
      description: "Roads, sanitation, and public facilities upgrades.",
      icon: "tools",
    },
    {
      title: "Health & Awareness Drives",
      description: "Free medical camps and wellness awareness campaigns.",
      icon: "heart",
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the single page content document, creating it with defaults if absent. */
export async function getPageContent(): Promise<IPageContent> {
  const doc = await PageContent.findOneAndUpdate(
    {},
    { $setOnInsert: DEFAULT_PAGE_CONTENT },
    { upsert: true, new: true, runValidators: true }
  );
  return doc!;
}
