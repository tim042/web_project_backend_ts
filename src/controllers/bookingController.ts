import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/booking';
import RoomType, { IRoomType } from '../models/roomType';

// Extend the Request object to include the user data from authentication middleware
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        _id: string;
    };
}

/**
 * Creates a new booking.
 * @route POST /api/bookings
 */
export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { property, roomType, rooms, guests, checkIn, checkOut, baseTotal, total, breakdown } = req.body;

        const room: IRoomType | null = await RoomType.findById(roomType);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room type not found' });
        }
        if (room.availableRooms < rooms) {
            return res.status(400).json({ success: false, message: 'Not enough available rooms' });
        }

        const booking = new Booking({
            user: req.user?.userId,
            property,
            roomType,
            rooms,
            guests,
            checkIn,
            checkOut,
            baseTotal,
            total,
            breakdown
        });

        const savedBooking: IBooking = await booking.save();

        room.availableRooms -= rooms;
        await room.save();

        return res.status(201).json({ success: true, message: 'Booking created successfully', data: savedBooking });

    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error creating booking', error: error.message });
    }
};


/** * Updates the status of a booking (Admin only).
 * @route PUT /api/bookings/:id/status
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking: IBooking | null = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        booking.status = status;
        const updatedBooking: IBooking = await booking.save();
        return res.json({ success: true, message: 'Booking status updated', data: updatedBooking });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error updating booking status', error: error.message });
    }
};

/**
 * Get all bookings for the authenticated user.
 * @route GET /api/bookings/me
 */
export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        
        const bookings = await Booking.find({ user: req.user.userId })
            .populate('property', 'name address')
            .populate('roomType', 'name price')
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: bookings });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};