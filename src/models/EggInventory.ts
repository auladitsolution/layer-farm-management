import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEggInventoryDocument extends Document {
  totalPieces: number;
  goodPieces: number;
  brokenPieces: number;
  dirtyPieces: number;
  lastUpdated: Date;
}

const EggInventorySchema = new Schema<IEggInventoryDocument>(
  {
    totalPieces: { type: Number, default: 0, min: 0 },
    goodPieces: { type: Number, default: 0, min: 0 },
    brokenPieces: { type: Number, default: 0, min: 0 },
    dirtyPieces: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EggInventory: Model<IEggInventoryDocument> =
  mongoose.models.EggInventory || mongoose.model<IEggInventoryDocument>('EggInventory', EggInventorySchema);
