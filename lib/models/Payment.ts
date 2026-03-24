import mongoose, { Document, Model, Schema } from "mongoose";
import type { PaymentPlanType } from "@/lib/payment-receipt-types";

export type { PaymentPlanType };

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  planType: PaymentPlanType;
  amountPaise: number;
  paymentId: string;
  orderId: string;
  method: string;
  status: string;
  date: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    planType: {
      type: String,
      required: true,
      enum: ["membership", "marriage"],
    },
    amountPaise: { type: Number, required: true },
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    method: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, required: true, default: "success" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
