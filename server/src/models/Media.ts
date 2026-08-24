import mongoose, { Schema, Document } from 'mongoose';

export type MediaType = 'photo' | 'video' | 'movie';

export interface IMediaMetadata {
  resolution?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number; // In seconds (videos/movies)
  releaseYear?: number; // For movies
  rating?: number; // 1-10 for movies
  director?: string; // For movies
  cast?: string[];
  thumbnailUrl?: string;
}

export interface IMedia extends Document {
  title: string;
  description?: string;
  type: MediaType;
  url: string;
  r2Key?: string;
  category: string;
  tags: string[];
  metadata: IMediaMetadata;
  views: number;
  likes: number;
  isFeatured: boolean;
  isDeleted?: boolean;
  isHidden?: boolean;
  uploadedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema: Schema<IMedia> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['photo', 'video', 'movie'],
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
    },
    r2Key: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      default: 'General',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    metadata: {
      resolution: { type: String, default: '1920x1080' },
      width: { type: Number, default: 1920 },
      height: { type: Number, default: 1080 },
      fileSize: { type: Number, default: 1024000 },
      mimeType: { type: String, default: 'image/jpeg' },
      duration: { type: Number, default: 0 },
      releaseYear: { type: Number, default: new Date().getFullYear() },
      rating: { type: Number, default: 8.5 },
      director: { type: String, default: '' },
      cast: { type: [String], default: [] },
      thumbnailUrl: { type: String, default: '' },
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.Mixed,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance querying across 500+ items
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ type: 1, category: 1 });
MediaSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Media = mongoose.model<IMedia>('Media', MediaSchema);
