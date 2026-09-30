import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerDocument extends Document {
  name: string;
  businessName?: string;
  phone: string;
  address?: string;
  openingBalance: number;
  currentDue: number;
  totalPurchases: number;
  totalPaid: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    name: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    openingBalance: { type: Number, default: 0 },
    currentDue: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
