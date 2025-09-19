import { Request, Response } from 'express';
import Review, { IReview } from '../models/review';
import Property, { IProperty } from '../models/property';

// Extend the Request object to include the user data from authentication middleware
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        _id: string;
        role: string;
    };
}

/**
 * Create a new review.
 * A user can only create one review per property.
 * @route POST /api/reviews
 */
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { property, rating, comment, images } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication is required.' });
        }

        // Check if the user has already reviewed this property
        const existingReview = await Review.findOne({ property, user: userId });
        if (existingReview) {
            return res.status(409).json({ success: false, message: 'You have already reviewed this property.' });
        }

        // Check if the property exists
        const foundProperty = await Property.findById(property);
        if (!foundProperty) {
            return res.status(404).json({ success: false, message: 'Property not found.' });
        }

        const newReview: IReview = new Review({
            property,
            user: userId,
            rating,
            comment,
            images,
        });

        const savedReview = await newReview.save();

        // Push the new review to the property's reviews array
        foundProperty.reviews.push(savedReview.id);
        await foundProperty.save();

        return res.status(201).json({ success: true, message: 'Review created successfully.', data: savedReview });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error creating review.', error: error.message });
    }
};

/**
 * Get all reviews for a specific property.
 * @route GET /api/reviews/:propertyId
 */
export const getReviewsByProperty = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { propertyId } = req.params;
        const reviews = await Review.find({ property: propertyId })
            .populate('user', 'firstName lastName')
            .populate('images', 'url');

        if (!reviews.length) {
            return res.status(404).json({ success: false, message: 'No reviews found for this property.' });
        }

        return res.json({ success: true, data: reviews });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error fetching reviews.', error: error.message });
    }
};

/**
 * Get a specific review by ID.
 * @route GET /api/reviews/:id
 */
export const getReviewById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .populate('images', 'url');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        return res.json({ success: true, data: review });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error fetching review.', error: error.message });
    }
};

/**
 * Update a review. Only the owner of the review can update it.
 * @route PUT /api/reviews/:id
 */
export const updateReview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const review = await Review.findOneAndUpdate(
            { _id: id, user: userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found or not authorized to update.' });
        }

        return res.json({ success: true, message: 'Review updated successfully.', data: review });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error updating review.', error: error.message });
    }
};

/**
 * Delete a review. Only the owner of the review or an admin can delete it.
 * @route DELETE /api/reviews/:id
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        const review = await Review.findOne({ _id: id });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        // Check for authorization
        if (review.user.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
        }

        await Review.deleteOne({ _id: id });

        // Remove the review from the property's reviews array
        const property = await Property.findById(review.property);
        if (property) {
            property.reviews = property.reviews.filter(revId => revId.toString() !== id);
            await property.save();
        }

        return res.json({ success: true, message: 'Review deleted successfully.' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error deleting review.', error: error.message });
    }
};