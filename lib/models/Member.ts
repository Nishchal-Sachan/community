import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMember extends Document {
  name: string;
  phone: string;
  area: string;
  joinedAt: Date;
  isPublic: boolean;
}

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number format"],
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
      minlength: [2, "Area must be at least 2 characters"],
      maxlength: [100, "Area must be at most 100 characters"],
    },
    joinedAt: {
      type: Date,
      default: () => new Date(),
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for the most common query pattern
MemberSchema.index({ isPublic: 1, joinedAt: -1 });

const Member: Model<IMember> =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

export default Member;
