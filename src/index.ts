import express, { Application } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import your own modules
import main from "./main";
import connectDb from "./config/connectDB";

// Load environment variables
dotenv.config();

const app: Application = express();

// Connect to database
connectDb();

// Enable JSON body parsing
app.use(express.json());

// Use the main router for all API routes
app.use("/api", main);

// Enable Helmet middleware for security
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

app.use(limiter);

// Define port with fallback
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on: ${PORT}`);
});

