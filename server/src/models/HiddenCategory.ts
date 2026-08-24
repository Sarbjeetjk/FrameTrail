import mongoose, { Schema, Document } from 'mongoose';

export interface IHiddenCategory extends Document {
  name: string;
  createdAt: Date;
}

const HiddenCategorySchema: Schema<IHiddenCategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HiddenCategory = mongoose.model<IHiddenCategory>('HiddenCategory', HiddenCategorySchema);
