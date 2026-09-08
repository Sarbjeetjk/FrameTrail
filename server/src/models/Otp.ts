import mongoose, { Schema, Document } from 'mongoose';

export type OtpPurpose = 'register' | 'forgot_password' | 'profile_update' | 'account_unlock';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  attempts: number;
  createdAt: Date;
}

const OtpSchema: Schema<IOtp> = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'forgot_password', 'profile_update', 'account_unlock'],
      default: 'register',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL Index: automatically expires and deletes after 10 minutes (600 seconds)
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for querying active OTP by email and purpose
OtpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
