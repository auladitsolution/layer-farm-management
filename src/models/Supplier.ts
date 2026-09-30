import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplierDocument extends Document {
  name: string;
  companyName?: string;
  phone: string;
  address?: string;
  category: 'FEED' | 'CHICKS' | 'MEDICINE' | 'EQUIPMENT' | 'OTHER';
  openingBalance: number;
  currentPayable: number;
  totalPurchases: number;
  totalPaid: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplierDocument>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    category: {
      type: String,
      enum: ['FEED', 'CHICKS', 'MEDICINE', 'EQUIPMENT', 'OTHER'],
      default: 'FEED',
    },
    openingBalance: { type: Number, default: 0 },
    currentPayable: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Supplier: Model<ISupplierDocument> =
  mongoose.models.Supplier || mongoose.model<ISupplierDocument>('Supplier', SupplierSchema);
