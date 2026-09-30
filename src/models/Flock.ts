import mongoose, { Schema, Document, Model } from 'mongoose';
import { FlockStatus } from '@/types';

export interface IFlockDocument extends Document {
  batchId: string;
  name: string;
  breed: string;
  supplier: string;
  shedId: mongoose.Types.ObjectId;
  arrivalDate: Date;
  ageInWeeksAtArrival: number;
  initialBirdCount: number;
  currentBirdCount: number;
  purchaseCostPerBird: number;
  totalPurchaseCost: number;
  status: FlockStatus;
  notes?: string;
  closedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlockSchema = new Schema<IFlockDocument>(
  {
    batchId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    shedId: { type: Schema.Types.ObjectId, ref: 'Shed', required: true },
    arrivalDate: { type: Date, required: true },
    ageInWeeksAtArrival: { type: Number, required: true, min: 0 },
    initialBirdCount: { type: Number, required: true, min: 1 },
    currentBirdCount: { type: Number, required: true, min: 0 },
    purchaseCostPerBird: { type: Number, default: 0, min: 0 },
    totalPurchaseCost: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'CULLED', 'SOLD', 'CLOSED'],
      default: 'ACTIVE',
    },
    notes: { type: String },
    closedDate: { type: Date },
  },
  { timestamps: true }
);

export const Flock: Model<IFlockDocument> =
  mongoose.models.Flock || mongoose.model<IFlockDocument>('Flock', FlockSchema);
