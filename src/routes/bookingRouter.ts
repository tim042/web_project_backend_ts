import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();


router.post('/', authenticate, bookingController.createBooking);

router.get('/', authenticate, bookingController.getUserBookings);

router.put('/:id/status', authenticate, bookingController.updateBookingStatus);

export default router;