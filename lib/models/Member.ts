import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IMember extends Document {
  userId?: Types.ObjectId;
  /** Display / legacy — kept in sync with fullName */
  name: string;
  fullName?: string;
  phone: string;
  /** Legacy combined city/state; maintained for backward compatibility */
  area: string;
  city?: string;
  state?: string;
  email?: string;
  address?: string;
  occupation?: string;
  joinedAt: Date;
  isPublic: boolean;
}

const MemberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Full name must be at most 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number format"],
    },
    area: {
      type: String,
      trim: true,
      maxlength: [100, "Area must be at most 100 characters"],
      default: "",
    },
    city: {
      type: String,
      trim: true,
      maxlength: [80, "City is too long"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [80, "State is too long"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [320, "Email is too long"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address is too long"],
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [120, "Occupation is too long"],
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

MemberSchema.pre("save", function (next) {
  const fn = (this.fullName ?? "").trim();
  const n = (this.name ?? "").trim();
  if (fn && !n) this.set("name", fn);
  if (n && !fn) this.set("fullName", n);
  next();
});

MemberSchema.index({ isPublic: 1, joinedAt: -1 });

const Member: Model<IMember> =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

export default Member;
