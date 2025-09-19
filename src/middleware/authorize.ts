import { Request, Response, NextFunction } from "express";

// Extend Express Request to include `user`
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
}

// Define role permissions
const rolePermissions: Record<string, string[]> = {
  admin: [
    "users.create", "users.read", "users.update", "users.delete",
    "properties.create", "properties.read", "properties.update", "properties.delete",
    "bookings.create", "bookings.read", "bookings.update", "bookings.delete",
    "reviews.create", "reviews.read", "reviews.update", "reviews.delete",
    "reports.view", "reports.generate", "logout"
  ],
  host: [
    "properties.create", "properties.read", "properties.update", "properties.delete",
    "bookings.read", "bookings.update",
    "reviews.read",
    "reports.view", "logout"
  ],
  guest: [
    "properties.read", "search.properties", "update.profile", "logout",
    "bookings.create", "bookings.read", "bookings.update", "bookings.delete",
    "reviews.create", "reviews.read", "reviews.update", "reviews.delete"
  ]
};

// Get permissions for a role
export const getRolePermissions = (role: string): string[] => {
  return rolePermissions[role] || [];
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

// Permission-based authorization
export const authorizePermissions = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userPermissions = getRolePermissions(req.user.role);

      const hasPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermissions) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: requiredPermissions,
          available: userPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("Permission authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

// Resource ownership check
export const authorizeOwnership = (resourceParam = "id") => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    try {
      const resourceId = req.params[resourceParam];
      const userId = req.user?.userId;

      // Admin and host can access any resource
      if (req.user && ["admin", "host"].includes(req.user.role)) {
        return next();
      }

      // TODO: Implement actual ownership check depending on resource type
      // For now, we just pass through
      next();
    } catch (error) {
      console.error("Ownership authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};
