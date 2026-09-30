import mongoose, { Schema, Document, Model } from 'mongoose';
import { ShedType, ShedStatus } from '@/types';

export interface IShedDocument extends Document {
  name: string;
  code: string;
  capacity: number;
  currentOccupancy: number;
  type: ShedType;
  status: ShedStatus;
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShedSchema = new Schema<IShedDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    type: {
      type: String,
      enum: ['LAYER', 'GROWER', 'BROODER', 'GENERAL'],
      default: 'LAYER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EMPTY', 'MAINTENANCE', 'CLEANING'],
      default: 'ACTIVE',
    },
    notes: { type: String },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export const Shed: Model<IShedDocument> =
  mongoose.models.Shed || mongoose.model<IShedDocument>('Shed', ShedSchema);
