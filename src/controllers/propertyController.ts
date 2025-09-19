import { Request, Response } from 'express';
import Property, { IProperty } from '../models/property';

// Interface for the user object attached by middleware
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        _id: string; // Assuming middleware sets a user object with a Mongo ObjectId
    };
}

/**
 * Creates a new property.
 * @route POST /api/properties
 */
export const createProperty = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const property = new Property({
            ...req.body,
            owner: req.user?.userId // Use optional chaining to be safe
        });

        const savedProperty = await property.save();

        return res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: savedProperty
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Error creating property',
            error: error.message
        });
    }
};

/**
 * Gets all properties with filters and pagination.
 * @route GET /api/properties
 */
export const getProperties = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { search, city, country, propertyType, status, limit = 20, page = 1 } = req.query;

        let query: any = {};

        // 🔍 Search by name or description
        if (search) {
            query.$text = { $search: search };
        }

        // 🌍 Filter by city/country
        if (city) query['address.city'] = city;
        if (country) query['address.country'] = country;

        // 🏨 Filter by type
        if (propertyType) query.propertyType = propertyType;

        // 📌 Filter by status
        if (status) query.status = status;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const properties = await Property.find(query)
            .populate('owner', 'firstName lastName email')
            .populate('amenities', 'name icon description')
            .populate('images', 'url type')
            .populate('reviews', 'rating comment user')
            .populate('cancellationPolicy', 'policyName rules')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit as string))
            .skip(skip);

        const total = await Property.countDocuments(query);

        return res.json({
            success: true,
            data: properties,
            pagination: {
                currentPage: parseInt(page as string),
                totalPages: Math.ceil(total / parseInt(limit as string)),
                totalResults: total
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching properties',
            error: error.message
        });
    }
};

/**
 * Gets a single property by its ID.
 * @route GET /api/properties/:id
 */
export const getPropertyById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'firstName lastName email')
            .populate('amenities', 'name icon description')
            .populate('images', 'url type')
            .populate('reviews', 'rating comment user')
            .populate('cancellationPolicy', 'policyName rules');

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        return res.json({ success: true, data: property });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Updates a property using PUT (replaces the entire document).
 * @route PUT /api/properties/:id
 */
export const updateProperty = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, owner: req.user?._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized' });
        }

        return res.json({ success: true, message: 'Property updated successfully', data: property });
    } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * Partially updates a property using PATCH.
 * @route PATCH /api/properties/:id
 */
export const updatePropertyPath = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const property = await Property.findOneAndUpdate(
            { _id: req.params.id, owner: req.user?._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized' });
        }

        return res.json({ success: true, message: 'Property updated successfully', data: property });
    } catch (err: any) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * Deletes a property.
 * @route DELETE /api/properties/:id
 */
export const deleteProperty = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const property = await Property.findOneAndDelete({
            _id: req.params.id,
            owner: req.user?._id
        });

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized' });
        }

        return res.json({ success: true, message: 'Property deleted successfully' });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};