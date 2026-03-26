import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHelpRequest extends Document {
  name: string;
  phone: string;
  email: string;
  category: string;
  subCategory: string;
  location: string;
  description: string;
  urgency: string;
  /** Present when user attached a file (admin panel). */
  attachmentUrl: string;
  createdAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

const HelpRequestSchema = new Schema<IHelpRequest>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    urgency: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, required: false },
  },
  { timestamps: false },
);

HelpRequestSchema.index({ createdAt: -1 });
HelpRequestSchema.index({ resolved: 1, createdAt: -1 });

const HelpRequest: Model<IHelpRequest> =
  mongoose.models.HelpRequest ??
  mongoose.model<IHelpRequest>("HelpRequest", HelpRequestSchema);

export default HelpRequest;
