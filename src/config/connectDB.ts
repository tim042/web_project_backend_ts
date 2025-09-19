import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (retries = 5, delay = 3000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      const mongoUri = process.env.MongoDB_URI as string;
      if (!mongoUri) {
        throw new Error("MongoDB_URI is not defined in environment variables");
      }

      await mongoose.connect(mongoUri);
      console.log("✅ Connected to MongoDB successfully");
      console.log(`📂 Database: ${mongoose.connection.name}`);
      return;
    } catch (err) {
      console.log(
        `❌ Connection attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error("❌ Unable to connect to the database after multiple attempts");
};

// Event listeners
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB connection lost");
});

mongoose.connection.on("error", (error) => {
  console.error(`🚨 MongoDB connection error: ${error}`);
});

export default connectDB;
