import mongoose, { Document, Schema, Model } from "mongoose";
import { hashPassword } from "../utils/passwordUtils";

// Refresh token type
export interface IRefreshToken {
  token: string;
  createdAt?: Date;
}

// Profile type
export interface IUserProfile {
  avatar?: string;
  country?: string;
  preferredLanguage?: string;
}

// User document interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  gender?: "male" | "female" | "other" | null;
  country?: string | null;
  birthdate?: string;
  password: string;
  role: "guest" | "host" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date | null;
  loginAttempts: number;
  lockUntil?: Date | null;
  refreshTokens: IRefreshToken[];
  profile: IUserProfile;

  // Virtuals
  fullName?: string;
  isLocked?: boolean;

  // Methods
  toJSON(): Record<string, any>;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// Refresh token schema
const refreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Profile schema
const profileSchema = new Schema<IUserProfile>({
  avatar: { type: String, default: null },
  country: String,
  preferredLanguage: String,
});

// User schema
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v: string) =>
          /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(v),
        message: "Please enter a valid email address",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"],
    },
    phone: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^\+?[\d\s-()]{8,15}$/.test(v),
        message: "Please enter a valid phone number",
      },
    },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    country: { type: String, default: null },
    birthdate: { type: String },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["guest", "host", "admin"], default: "guest" },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    refreshTokens: [refreshTokenSchema],
    profile: profileSchema,
  },
  { timestamps: true }
);

// Virtuals
userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Hash password before save
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (err) {
    next(err as any);
  }
});

// Remove sensitive data
userSchema.methods.toJSON = function (this: IUser) {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

// Account lock helpers
userSchema.methods.incLoginAttempts = function (this: IUser) {
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }).exec();
  }
  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hr
  }
  return this.updateOne(updates).exec();
};

userSchema.methods.resetLoginAttempts = function (this: IUser) {
  return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } }).exec();
};

// Export User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
