import { Router } from "express";

const router = Router();

import authRoutes from "./routes/authRoute";
import propertyRoutes from "./routes/propertyRoute";
import userRoutes from "./routes/userRoute";
import bookingRoutes from "./routes/bookingRouter";
import reviewRoutes from "./routes/review";
import roomRoutes from "./routes/roomRoute";

// Use the imported routes
router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/rooms", roomRoutes);

export default router;