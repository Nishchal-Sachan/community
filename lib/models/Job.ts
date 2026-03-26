import mongoose, { Document, Model, Schema } from "mongoose";
import { JOB_MAX_LENGTHS } from "@/lib/job-field-limits";

export type JobType = "job" | "profile";

export type JobPostingType = "Full-time" | "Part-time" | "Internship" | "Freelance";
export type ExperienceLevel = "fresher" | "1-3" | "3plus";

export interface IJob extends Document {
  type: JobType;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  /** Employer job postings only */
  company?: string;
  jobRole?: string;
  jobType?: JobPostingType;
  experience?: ExperienceLevel;
  salaryMin?: string;
  salaryMax?: string;
  salaryNote?: string;
  /** Always stored as a string array (may be empty). */
  skills?: string[];
  remote?: boolean;
  /** Job seeker profiles only */
  bio?: string;
  preferredJobType?: JobPostingType;
  education?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_LENGTHS = JOB_MAX_LENGTHS;

/**
 * All job-portal form fields are declared here so Mongoose strict mode persists them.
 * `skills` is `[String]`; `remote` is Boolean (see schema below).
 */
const JobSchema = new Schema<IJob>(
  {
    type: {
      type: String,
      enum: ["job", "profile"],
      required: true,
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

    company: {
      type: String,
      trim: true,
      maxlength: [MAX_LENGTHS.company, `Company cannot exceed ${MAX_LENGTHS.company} characters`],
    },
    jobRole: {
      type: String,
      trim: true,
      maxlength: [MAX_LENGTHS.jobRole, `Job role cannot exceed ${MAX_LENGTHS.jobRole} characters`],
    },
    jobType: {
      type: String,
      trim: true,
      maxlength: MAX_LENGTHS.jobType,
    },
    experience: {
      type: String,
      trim: true,
      maxlength: MAX_LENGTHS.experience,
    },

    salaryMin: {
      type: String,
      trim: true,
      maxlength: [MAX_LENGTHS.salaryMin, `Salary min cannot exceed ${MAX_LENGTHS.salaryMin} characters`],
    },
    salaryMax: {
      type: String,
      trim: true,
      maxlength: [MAX_LENGTHS.salaryMax, `Salary max cannot exceed ${MAX_LENGTHS.salaryMax} characters`],
    },
    salaryNote: {
      type: String,
      trim: true,
      maxlength: [MAX_LENGTHS.salaryNote, `Salary note cannot exceed ${MAX_LENGTHS.salaryNote} characters`],
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator(arr: unknown) {
          if (!Array.isArray(arr)) return false;
          return arr.length <= MAX_LENGTHS.skillsMaxCount;
        },
        message: "Too many skills listed",
      },
    },

    remote: {
      type: Boolean,
      default: false,
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

    /** Candidate profile — keep alongside employer job fields */
    bio: {
      type: String,
      trim: true,
      maxlength: [
        MAX_LENGTHS.bio,
        `Bio cannot exceed ${MAX_LENGTHS.bio} characters`,
      ],
    },
    preferredJobType: {
      type: String,
      trim: true,
      maxlength: MAX_LENGTHS.jobType,
    },
    education: {
      type: String,
      trim: true,
      maxlength: [
        MAX_LENGTHS.education,
        `Education cannot exceed ${MAX_LENGTHS.education} characters`,
      ],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, strict: true }
);

const Job: Model<IJob> =
  (mongoose.models?.Job as Model<IJob> | undefined) ??
  mongoose.model<IJob>("Job", JobSchema);

export default Job;
