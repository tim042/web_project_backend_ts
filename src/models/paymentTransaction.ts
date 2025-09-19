import mongoose, { Schema, Document, Model } from 'mongoose';
import { IBooking as BookingDocument } from './booking';
import { IUser as UserDocument } from './user';

// Define the interface for a Payment document
export interface IPaymentTransaction extends Document {
    booking: mongoose.Types.ObjectId | BookingDocument;
    user: mongoose.Types.ObjectId | UserDocument;
    provider: 'stripe' | 'paypal' | 'qr' | 'manual';
    providerPaymentId?: string;
    amount: number;
    currency: string;
    status: 'initiated' | 'paid' | 'failed' | 'refunded' | 'void';
    paidAt?: Date;
    refundedAt?: Date;
    rawResponse?: mongoose.Schema.Types.Mixed;
    meta?: mongoose.Schema.Types.Mixed;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const paymentSchema: Schema<IPaymentTransaction> = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: String,
        enum: ['stripe', 'paypal', 'qr', 'manual'],
        required: true,
    },
    providerPaymentId: {
        type: String,
        sparse: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'LAK',
    },
    status: {
        type: String,
        enum: ['initiated', 'paid', 'failed', 'refunded', 'void'],
        default: 'initiated',
    },
    paidAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
    rawResponse: {
        type: mongoose.Schema.Types.Mixed,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    },
}, { timestamps: true });

// Define a sparse index on providerPaymentId
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });

// Export the model
const PaymentTransaction: Model<IPaymentTransaction> = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentSchema);
export default PaymentTransaction;