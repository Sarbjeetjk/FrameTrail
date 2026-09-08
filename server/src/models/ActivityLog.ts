import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  id?: string;
  event: string;
  detail: string;
  level: 'info' | 'warn' | 'success' | 'error';
  user: string;
  userId?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  userRole?: 'admin' | 'user' | 'visitor';
  ip: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  device: string;
  isp?: string;
  networkType?: string;
  screenRes?: string;
  timezone?: string;
  hardwareSpec?: string;
  metadata?: Record<string, any>;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    event: {
      type: String,
      required: [true, 'Event is required'],
      index: true,
      trim: true,
    },
    detail: {
      type: String,
      required: [true, 'Detail is required'],
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'success', 'error'],
      default: 'info',
      index: true,
    },
    user: {
      type: String,
      required: [true, 'User is required'],
      default: 'Guest Visitor',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ['admin', 'user', 'visitor'],
      default: 'visitor',
      index: true,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
      index: true,
    },
    location: {
      type: String,
      default: 'New Delhi, India',
    },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    device: {
      type: String,
      default: 'Desktop (Browser)',
    },
    isp: {
      type: String,
      default: 'Reliance Jio Infocomm Limited',
    },
    networkType: {
      type: String,
      default: '4G / Wi-Fi',
    },
    screenRes: {
      type: String,
      default: '1920 x 1080',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    hardwareSpec: {
      type: String,
      default: '16 GB RAM (8 CPU Cores)',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search and sort queries
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ isArchived: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
