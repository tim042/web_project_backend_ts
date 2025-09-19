import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import { hashPassword } from '../utils/passwordUtils';

require('../models/user');


// Extend the Request object to include the user data from authentication middleware
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        _id: string;
        role: string;
    };
}

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { role, isActive, limit = 50, page = 1 } = req.query;
        
        const query: any = {};
        
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit as string))
            .skip(skip);
        
        const total = await User.countDocuments(query);
        
        return res.json({
            success: true,
            data: users,
            pagination: {
                current: parseInt(page as string),
                total: Math.ceil(total / parseInt(limit as string)),
                count: users.length,
                totalUsers: total
            }
        });
        
    } catch (error: any) {
        console.error('Get users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// Get single user
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.json({
            success: true,
            data: { user }
        });
        
    } catch (error: any) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

// Create user (Admin only - with role hierarchy)
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { firstName, lastName, email, username, country, gender, birthdate, phone, password, role = 'guest' } = req.body;
        const currentUserRole = req.user?.role;
        
        // 🔒 Role-based creation permissions
        const roleHierarchy: { [key: string]: string[] } = {
            'admin': ['admin', 'host', 'guest'],
        };
        
        const allowedRoles = roleHierarchy[currentUserRole || ''] || [];
        
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: `${currentUserRole}s cannot create users with ${role} role`
            });
        }
        
        // Check for existing users
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email ? 
                    'Email already registered' : 
                    'Username already taken'
            });
        }
        
        // Create user
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            phone,
            gender,
            password: hashedPassword,
            birthdate: req.body.birthdate,
            country: req.body.country || null,
            role, // Use the provided role directly, as we've already validated it
        });
        
        await newUser.save();
        
        // Remove sensitive data from response
        const userResponse: any = newUser.toObject();
        delete userResponse.password;
        delete userResponse.refreshTokens;
        
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userResponse }
        });
        
    } catch (error: any) {
        console.error('User creation error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Update user (Admin)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { firstName, lastName, email, username, role, gender, phone, birthdate, isActive, profile } = req.body;
        const userId = req.params.id;
        const currentUserRole = req.user?.role;
        
        // Only admins can change roles to admin
        if (role === 'admin' && currentUserRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can change roles to admin'
            });
        }
        
        const updateData: any = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (username) updateData.username = username;
        if (phone) updateData.phone = phone;
        if (birthdate) updateData.birthdate = birthdate;
        if (gender) updateData.gender = gender;
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (profile) updateData.profile = { ...updateData.profile, ...profile };
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
        
    } catch (error: any) {
        console.error('Update user error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        return res.status(400).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

// Delete user (soft delete - Admin only)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user?.userId;
        
        // Cannot delete yourself
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.json({
            success: true,
            message: 'User deactivated successfully'
        });
        
    } catch (error: any) {
        console.error('Delete user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// Change user role (Admin only)
export const changeUserRole = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        const currentUserId = req.user?.userId;
        
        // Cannot change your own role
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
        
    } catch (error: any) {
        console.error('Change role error:', error);
        return res.status(400).json({
            success: false,
            message: 'Failed to change user role',
            error: error.message
        });
    }
};