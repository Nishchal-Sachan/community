import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMatrimony extends Document {
  fullName: string;
  age: number;
  gender: "male" | "female";
  profilePhotoUrl: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MAX_LENGTHS = {
  fullName: 120,
  profilePhotoUrl: 2048,
  height: 50,
  maritalStatus: 80,
  religion: 120,
  caste: 120,
  education: 200,
  profession: 200,
  income: 100,
  location: 200,
  about: 3000,
  contactName: 120,
  contactPhone: 20,
  contactEmail: 320,
} as const;

const MatrimonySchema = new Schema<IMatrimony>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.fullName, `Full name cannot exceed ${MAX_LENGTHS.fullName} characters`],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [120, "Invalid age"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female"],
    },
    profilePhotoUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: [MAX_LENGTHS.profilePhotoUrl, `Photo URL cannot exceed ${MAX_LENGTHS.profilePhotoUrl} characters`],
    },
    height: {
      type: String,
      required: [true, "Height is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.height, `Height cannot exceed ${MAX_LENGTHS.height} characters`],
    },
    maritalStatus: {
      type: String,
      required: [true, "Marital status is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.maritalStatus, `Marital status cannot exceed ${MAX_LENGTHS.maritalStatus} characters`],
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.religion, `Religion cannot exceed ${MAX_LENGTHS.religion} characters`],
    },
    caste: {
      type: String,
      required: [true, "Caste is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.caste, `Caste cannot exceed ${MAX_LENGTHS.caste} characters`],
    },
    education: {
      type: String,
      required: [true, "Education is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.education, `Education cannot exceed ${MAX_LENGTHS.education} characters`],
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.profession, `Profession cannot exceed ${MAX_LENGTHS.profession} characters`],
    },
    income: {
      type: String,
      required: [true, "Income is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.income, `Income cannot exceed ${MAX_LENGTHS.income} characters`],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.location, `Location cannot exceed ${MAX_LENGTHS.location} characters`],
    },
    about: {
      type: String,
      required: [true, "About is required"],
      trim: true,
      maxlength: [MAX_LENGTHS.about, `About cannot exceed ${MAX_LENGTHS.about} characters`],
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

const Matrimony: Model<IMatrimony> =
  mongoose.models.Matrimony ?? mongoose.model<IMatrimony>("Matrimony", MatrimonySchema);

export default Matrimony;
export { MAX_LENGTHS as MATRIMONY_MAX_LENGTHS };
