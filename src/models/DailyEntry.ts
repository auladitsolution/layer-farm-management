import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyEntryDocument extends Document {
  date: string; // YYYY-MM-DD
  shedId: mongoose.Types.ObjectId;
  flockId: mongoose.Types.ObjectId;
  openingBirdCount: number;
  totalEggs: number;
  goodEggs: number;
  brokenEggs: number;
  dirtyEggs: number;
  rejectedEggs: number;
  feedConsumedKg: number;
  waterLiters?: number;
  mortalityCount: number;
  culledCount: number;
  closingBirdCount: number;
  eggProductionPercentage: number;
  mortalityPercentage: number;
  feedPerBirdGrams: number;
  temperatureCelsius?: number;
  notes?: string;
  recordedByUid?: string;
  recordedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyEntrySchema = new Schema<IDailyEntryDocument>(
  {
    date: { type: String, required: true, index: true },
    shedId: { type: Schema.Types.ObjectId, ref: 'Shed', required: true },
    flockId: { type: Schema.Types.ObjectId, ref: 'Flock', required: true, index: true },
    openingBirdCount: { type: Number, required: true, min: 0 },
    totalEggs: { type: Number, required: true, min: 0, default: 0 },
    goodEggs: { type: Number, required: true, min: 0, default: 0 },
    brokenEggs: { type: Number, default: 0, min: 0 },
    dirtyEggs: { type: Number, default: 0, min: 0 },
    rejectedEggs: { type: Number, default: 0, min: 0 },
    feedConsumedKg: { type: Number, required: true, min: 0, default: 0 },
    waterLiters: { type: Number, default: 0, min: 0 },
    mortalityCount: { type: Number, default: 0, min: 0 },
    culledCount: { type: Number, default: 0, min: 0 },
    closingBirdCount: { type: Number, required: true, min: 0 },
    eggProductionPercentage: { type: Number, default: 0 },
    mortalityPercentage: { type: Number, default: 0 },
    feedPerBirdGrams: { type: Number, default: 0 },
    temperatureCelsius: { type: Number },
    notes: { type: String },
    recordedByUid: { type: String },
    recordedByName: { type: String },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate entries for same flock on the same date
DailyEntrySchema.index({ flockId: 1, date: 1 }, { unique: true });

export const DailyEntry: Model<IDailyEntryDocument> =
  mongoose.models.DailyEntry || mongoose.model<IDailyEntryDocument>('DailyEntry', DailyEntrySchema);
