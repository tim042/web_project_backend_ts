import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRate extends Document {
  base: string;
  target: string;
  rate: number;
  updatedAt: Date;
}

const exchangeRateSchema: Schema<IExchangeRate> = new Schema(
  {
    base: { type: String, required: true },
    target: { type: String, required: true },
    rate: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // or true if you want createdAt/updatedAt auto-managed
  }
);

// Ensure combination of base + target is unique
exchangeRateSchema.index({ base: 1, target: 1 }, { unique: true });

const ExchangeRate: Model<IExchangeRate> = mongoose.model<IExchangeRate>(
  "ExchangeRate",
  exchangeRateSchema
);

export default ExchangeRate;
