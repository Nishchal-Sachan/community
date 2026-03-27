import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserMembershipStatus = "none" | "pending" | "active";
export type MarriageSubscriptionStatus = "none" | "active";

export interface IUserMembership {
  isPaid: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  membershipStatus: UserMembershipStatus;
  marriageSubscriptionStatus: MarriageSubscriptionStatus;
  membership: IUserMembership;
  isBlogger: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "member"],
    },
    membershipStatus: {
      type: String,
      default: "none",
      enum: ["none", "pending", "active"],
    },
    marriageSubscriptionStatus: {
      type: String,
      default: "none",
      enum: ["none", "active"],
    },
    membership: {
      isPaid: { type: Boolean, default: false },
    },
    isBlogger: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
