import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router: Router = Router();

// Create a new review (authenticated users only)
router.post('/', authenticate,authorize , reviewController.createReview);

// Get all reviews for a specific property (public access)
router.get('/property/:propertyId', reviewController.getReviewsByProperty);

// Get a single review by ID (public access)
router.get('/:id', reviewController.getReviewById);

// Update a review (only the review owner)
router.put('/:id', authenticate, authorize, reviewController.updateReview);

// Delete a review (only the review owner or an admin)
router.delete('/:id', authenticate, authorize, reviewController.deleteReview);

export default router;