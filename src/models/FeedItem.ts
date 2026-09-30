import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedItemDocument extends Document {
  name: string;
  type: 'STARTER' | 'GROWER' | 'LAYER_1' | 'LAYER_2' | 'CUSTOM';
  brand: string;
  unit: string;
  bagWeightKg: number;
  currentStockKg: number;
  lowStockThresholdKg: number;
  averagePurchasePricePerKg: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedItemSchema = new Schema<IFeedItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['STARTER', 'GROWER', 'LAYER_1', 'LAYER_2', 'CUSTOM'],
      default: 'LAYER_1',
    },
    brand: { type: String, required: true, trim: true },
    unit: { type: String, default: 'কেজি' },
    bagWeightKg: { type: Number, default: 50, min: 1 },
    currentStockKg: { type: Number, default: 0, min: 0 },
    lowStockThresholdKg: { type: Number, default: 200, min: 0 },
    averagePurchasePricePerKg: { type: Number, default: 0, min: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FeedItem: Model<IFeedItemDocument> =
  mongoose.models.FeedItem || mongoose.model<IFeedItemDocument>('FeedItem', FeedItemSchema);
