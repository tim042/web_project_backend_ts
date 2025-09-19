import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser as UserDocument } from './user';

// Define the interface for a Media document
export interface IMedia extends Document {
    url: string;
    type: 'image' | 'video' | 'document';
    provider?: string;
    meta?: mongoose.Schema.Types.Mixed;
    uploadedBy?: mongoose.Types.ObjectId | UserDocument;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const mediaSchema: Schema<IMedia> = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['image', 'video', 'document'],
        default: 'image',
    },
    provider: {
        type: String,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Export the model
const Media: Model<IMedia> = mongoose.model<IMedia>('Media', mediaSchema);
export default Media;