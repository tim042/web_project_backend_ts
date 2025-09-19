#!/usr/bin/env ts-node

import mongoose from "mongoose";
import { hashPassword, validatePassword } from "../utils/passwordUtils";
import user from "../models/user";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

const initializeAdmin = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await user.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists. Exiting...");
      process.exit(0);
    }

    console.log("\n🔐 Creating Initial Admin User");
    console.log("================================\n");

    // Collect admin information
    const firstName = (await question("Enter admin first name: ")).trim();
    const lastName = (await question("Enter admin last name: ")).trim();
    const email = (await question("Enter admin email: ")).toLowerCase().trim();
    const username = (await question("Enter admin username: ")).toLowerCase().trim();

    let password: string;
    let passwordValid = false;

    while (!passwordValid) {
      password = await question(
        "Enter admin password (min 8 chars, must include uppercase, lowercase, number, special char): "
      );

      const validation = validatePassword(password);

      if (validation.isValid) {
        passwordValid = true;
      } else {
        console.log("❌ Password validation failed:");
        validation.errors.forEach((error: string) => console.log(`   - ${error}`));
        console.log("");
      }
    }

    // Option 1: Save password as-is (already hashed in User pre-save middleware?)
    // Option 2: Explicitly hash password before saving
    // const hashedPassword = await hashPassword(password);

    const adminUser = new user({
      firstName : 
      lastName,
      email,
      username,
      password: String,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      profile: {
        department: "administration",
      },
    });

    await adminUser.save();

    console.log("\n✅ Admin user created successfully!");
    console.log(`   Name: ${firstName} ${lastName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log("   Role: admin\n");

    console.log("🚀 You can now start the application and login with these credentials.");
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

initializeAdmin();
