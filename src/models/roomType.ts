import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProperty as PropertyDocument } from './property';

// Define the interface for a RoomType document
export interface IRoomType extends Document {
    property: mongoose.Types.ObjectId | PropertyDocument;
    name: string;
    totalRooms: number;
    availableRooms: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const roomTypeSchema: Schema<IRoomType> = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    totalRooms: {
        type: Number,
        required: true,
    },
    availableRooms: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

// Export the model
const RoomType: Model<IRoomType> = mongoose.model<IRoomType>('RoomType', roomTypeSchema);
export default RoomType;