import { Schema, model, Document } from "mongoose";

// interface สำหรับ type ของ CancellationPolicy
export interface ICancellationPolicy extends Document {
  name: string;
  description?: string;
  refundPercentage: number;
  cutoffHours: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema
const cancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    name: { type: String, required: true },
    description: { type: String },
    refundPercentage: { type: Number, default: 100 },
    cutoffHours: { type: Number, default: 24 },
  },
  { timestamps: true }
);

// Model
export const CancellationPolicy = model<ICancellationPolicy>(
  "CancellationPolicy",
  cancellationPolicySchema
);
