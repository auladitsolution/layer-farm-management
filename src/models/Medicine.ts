import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicineDocument extends Document {
  name: string;
  type: 'VACCINE' | 'ANTIBIOTIC' | 'VITAMIN' | 'DISINFECTANT' | 'DEWORMER' | 'OTHER';
  brand: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  expiryDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicineDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['VACCINE', 'ANTIBIOTIC', 'VITAMIN', 'DISINFECTANT', 'DEWORMER', 'OTHER'],
      default: 'VITAMIN',
    },
    brand: { type: String, required: true, trim: true },
    unit: { type: String, default: 'ভায়াল' },
    currentStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    expiryDate: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Medicine: Model<IMedicineDocument> =
  mongoose.models.Medicine || mongoose.model<IMedicineDocument>('Medicine', MedicineSchema);
