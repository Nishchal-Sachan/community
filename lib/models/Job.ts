import mongoose, { Document, Model, Schema } from "mongoose";

export type JobType = "job" | "profile";

export interface IJob extends Document {
  type: JobType;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MAX_LENGTHS = {
  title: 200,
  description: 5000,
  category: 100,
  location: 200,
  contactName: 120,
  contactPhone: 20,
  contactEmail: 320,
} as const;

const JobSchema = new Schema<IJob>(
  {
    type: {
      type: String,
      required: true,
      enum: ["job", "profile"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.title, `Title cannot exceed ${MAX_LENGTHS.title} characters`],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.description, `Description cannot exceed ${MAX_LENGTHS.description} characters`],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.category, `Category cannot exceed ${MAX_LENGTHS.category} characters`],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.location, `Location cannot exceed ${MAX_LENGTHS.location} characters`],
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.contactName, `Contact name cannot exceed ${MAX_LENGTHS.contactName} characters`],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.contactPhone, `Contact phone cannot exceed ${MAX_LENGTHS.contactPhone} characters`],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      maxlength: [MAX_LENGTHS.contactEmail, `Contact email cannot exceed ${MAX_LENGTHS.contactEmail} characters`],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default Job;
export { MAX_LENGTHS as JOB_MAX_LENGTHS };
