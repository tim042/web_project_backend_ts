import { Request, Response } from 'express';
import Room from '../models/rooms';
import Property from '../models/property'; 

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        _id: string;
        role: string;
    };
}

/**
 * Creates a new room for a property.
 * @route POST /api/rooms
 */
export const createRoom = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { property, name, description, price, availableRooms, amenities, images } = req.body;
        const ownerId = req.user?.userId;

        // Check if the property exists and is owned by the authenticated user
        const foundProperty = await Property.findOne({ _id: property, owner: ownerId });
        if (!foundProperty) {
            return res.status(404).json({ success: false, message: 'Property not found or you are not authorized to add rooms to it.' });
        }

        const room = new Room({
            property,
            name,
            description,
            price,
            availableRooms,
            amenities,
            images,
        });

        const savedRoom = await room.save();

        // Add the new room ID to the property's rooms array
        property.rooms.push(savedRoom._id);
        await property.save();

        return res.status(201).json({ success: true, message: 'Room created successfully', data: savedRoom });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error creating room', error: error.message });
    }
};

/**
 * Gets a single room by ID.
 * @route GET /api/rooms/:id
 */
export const getRoomById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('property', 'name address')
            .populate('amenities', 'name icon description')
            .populate('images', 'url type');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        return res.json({ success: true, data: room });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error fetching room', error: error.message });
    }
};

/**
 * Updates a room. Only the property owner can update it.
 * @route PUT /api/rooms/:id
 */
export const updateRoom = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const ownerId = req.user?.userId;

        // Find the room and ensure the user is the owner of the associated property
        const room = await Room.findById(id).populate('property');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const property: any = room.property;
        if (property.owner.toString() !== ownerId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
        }

        Object.assign(room, req.body);
        const updatedRoom = await room.save();

        return res.json({ success: true, message: 'Room updated successfully', data: updatedRoom });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error updating room', error: error.message });
    }
};
/** * Partially updates a room. Only the property owner can update it.
 * @route PATCH /api/rooms/:id
 */

export const updatePatchRoom = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const ownerId = req.user?.userId;

        const room = await Room.findById(id).populate('property');
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        const property: any = room.property;
        if (property.owner.toString() !== ownerId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
        }
        Object.assign(room, req.body);
        const updatedRoom = await room.save();
        return res.json({ success: true, message: 'Room updated successfully', data: updatedRoom });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: 'Error updating room', error: error.message });
    }
};

/**
 * Deletes a room. Only the property owner can delete it.
 * @route DELETE /api/rooms/:id
 */
export const deleteRoom = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const ownerId = req.user?.userId;

        // Find the room and ensure the user is the owner of the associated property
        const room = await Room.findById(id).populate('property');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const property: any = room.property;
        if (property.owner.toString() !== ownerId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
        }

        await Room.deleteOne({ _id: id });

        // Remove the room ID from the property's rooms array
        property.rooms = property.rooms.filter((roomId: string) => roomId.toString() !== id);
        await property.save();

        return res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error deleting room', error: error.message });
    }
};