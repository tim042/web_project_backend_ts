import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user';
import { IProperty } from './property';
import { IRoomType } from './roomType';
import { ICancellationPolicy } from './cancellationPolicy';

// Define the interface for the price breakdown sub-document
interface IPriceBreakdown {
    subTotal?: number;
    taxes?: number;
    fees?: number;
    discounts?: number;
    grandTotal?: number;
}

// Define the interface for a Booking document
export interface IBooking extends Document {
    user: mongoose.Types.ObjectId | IUser;
    property: mongoose.Types.ObjectId | IProperty;
    roomType: mongoose.Types.ObjectId | IRoomType;
    rooms: number;
    guests: number;
    checkIn: Date;
    checkOut: Date;
    nights?: number;
    baseCurrency: string;
    baseTotal: number;
    displayCurrency: string;
    total: number;
    breakdown?: IPriceBreakdown;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'refunded';
    cancellationPolicy?: mongoose.Types.ObjectId | ICancellationPolicy;
    createdByHost: boolean;
    meta?: mongoose.Schema.Types.Mixed;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema for the price breakdown
const priceBreakdownSchema: Schema<IPriceBreakdown> = new mongoose.Schema({
    subTotal: Number,
    taxes: Number,
    fees: Number,
    discounts: Number,
    grandTotal: Number,
}, { _id: false });

// Create the main Mongoose Schema for Bookings
const bookingSchema: Schema<IBooking> = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
        required: true,
    },
    rooms: {
        type: Number,
        default: 1,
    },
    guests: {
        type: Number,
        default: 1,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    nights: {
        type: Number,
    },
    baseCurrency: {
        type: String,
        default: 'LAK',
    },
    baseTotal: {
        type: Number,
        required: true,
    },
    displayCurrency: {
        type: String,
        default: 'LAK',
    },
    total: {
        type: Number,
        required: true,
    },
    breakdown: priceBreakdownSchema,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'refunded'],
        default: 'pending',
    },
    cancellationPolicy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CancellationPolicy',
    },
    createdByHost: {
        type: Boolean,
        default: false,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    },
}, { timestamps: true });

// Define indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

// Pre-save middleware to calculate nights
bookingSchema.pre<IBooking>('validate', function(next) {
    if (this.checkIn && this.checkOut && this.checkIn >= this.checkOut) {
        return next(new Error('checkOut must be after checkIn'));
    }
    if (this.checkIn && this.checkOut) {
        const ms = Math.abs(this.checkOut.getTime() - this.checkIn.getTime());
        this.nights = Math.ceil(ms / (24 * 60 * 60 * 1000));
    }
    next();
});

// Export the model
const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;