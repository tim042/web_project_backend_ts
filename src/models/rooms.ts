import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProperty as PropertyDocument } from './property';
import { IRoomType as RoomTypeDocument } from './roomType';

// Define the interface for a Room document
export interface IRoom extends Document {
    property: mongoose.Types.ObjectId | PropertyDocument;
    roomType?: mongoose.Types.ObjectId | RoomTypeDocument;
    identifier: string;
    status: 'available' | 'occupied' | 'maintenance';
    meta?: mongoose.Schema.Types.Mixed;
}

// Create the Mongoose Schema
const roomSchema: Schema<IRoom> = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
    },
    identifier: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available',
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    },
});

// Define a compound unique index
roomSchema.index({ property: 1, identifier: 1 }, { unique: true });

// Export the model
const Room: Model<IRoom> = mongoose.model<IRoom>('Room', roomSchema);
export default Room;