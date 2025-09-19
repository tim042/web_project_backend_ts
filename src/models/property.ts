import mongoose, { Schema, Document, Model } from 'mongoose';
import slugify from 'slugify';
import { IAmenity } from './amenity';
import { IMedia } from './media';
import { IReview } from './review';
import { ICancellationPolicy } from './cancellationPolicy';
import { IUser } from './user';

require('./amenity');
require('./media');
require('./review');
require('./cancellationPolicy');
require('./user');
// Define the shape of the sub-documents or nested objects
interface IAddress {
    city?: string;
    state?: string;
    country?: string;
}

interface ILocation {
    type: 'Point';
    coordinates: number[];
}

// Define the main interface for a Property document
export interface IProperty extends Document {
    owner: mongoose.Types.ObjectId | IUser;
    name: string;
    slug?: string;
    description?: string;
    propertyType: 'hotel' | 'apartment' | 'villa' | 'resort';
    address?: IAddress;
    location: ILocation;
    amenities: (mongoose.Types.ObjectId | IAmenity)[];
    images: (mongoose.Types.ObjectId | IMedia)[];
    reviews: (mongoose.Types.ObjectId | IReview)[];
    timezone?: string;
    currency: string;
    basePrice: number;
    proMotion: 'none' | 'pro' | 'super pro';
    proPrice: number;
    cancellationPolicy?: mongoose.Types.ObjectId | ICancellationPolicy;
    checkInTime?: string;
    checkOutTime?: string;
    minStay: number;
    maxStay?: number;
    status: 'draft' | 'published' | 'suspended';
    meta?: mongoose.Schema.Types.Mixed;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose Schema
const propertySchema: Schema<IProperty> = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        index: true,
    },
    description: {
        type: String,
    },
    propertyType: {
        type: String,
        enum: ['hotel', 'apartment', 'villa', 'resort'],
        default: 'hotel',
    },
    address: {
        city: String,
        state: String,
        country: String,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    amenities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
    }],
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
    timezone: {
        type: String,
    },
    currency: {
        type: String,
        default: 'LAK',
    },
    basePrice: {
        type: Number,
        required: true,
    },
    proMotion:{
        type: String,
        enum:["none","pro","super pro"],
        default: "none", 
    },
    proPrice:{
        type: Number,
        default: 0,
    },
    cancellationPolicy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CancellationPolicy',
    },
    checkInTime: {
        type: String,
    },
    checkOutTime: {
        type: String,
    },
    minStay: {
        type: Number,
        default: 1,
    },
    maxStay: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'suspended'],
        default: 'draft',
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
    },
}, { timestamps: true });

// Define indexes
propertySchema.index({ location: '2dsphere' });
propertySchema.index({ name: 'text', description: 'text' });

// Add pre-save middleware for slug generation
propertySchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true }).slice(0, 60);
    }
    next();
});

// Export the model
const Property: Model<IProperty> = mongoose.model<IProperty>('Property', propertySchema);
export default Property;