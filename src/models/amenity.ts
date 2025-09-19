import { Schema, model, Document } from "mongoose";

// กำหนด interface สำหรับข้อมูลใน collection
export interface IAmenity extends Document {
  name: string;
  icon?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// สร้าง schema
const amenitySchema = new Schema<IAmenity>(
  {
    name: { type: String, required: true },
    icon: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

// export model
export const Amenity = model<IAmenity>("Amenity", amenitySchema);
