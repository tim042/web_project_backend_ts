import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProperty as PropertyDocument } from './property';
import { IUser as UserDocument } from './user';
import { IMedia as MediaDocument } from './media';

// Define the interface for a Review document
export interface IReview extends Document {
    property: mongoose.Types.ObjectId | PropertyDocument;
    user: mongoose.Types.ObjectId | UserDocument;
    rating: number;
    comment?: string;
    images: (mongoose.Types.ObjectId | MediaDocument)[];
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const reviewSchema: Schema<IReview> = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
    }],
}, { timestamps: true });

// Export the model
const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;