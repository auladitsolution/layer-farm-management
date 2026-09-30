import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface IIncomeDocument extends Document {
  date: string;
  source: 'EGG_SALES' | 'SPENT_HEN' | 'MANURE_LITTER' | 'FEED_BAGS' | 'OTHER';
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerOrPayer?: string;
  referenceId?: string;
  notes?: string;
  createdAt: Date;
}

const IncomeSchema = new Schema<IIncomeDocument>(
  {
    date: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ['EGG_SALES', 'SPENT_HEN', 'MANURE_LITTER', 'FEED_BAGS', 'OTHER'],
      default: 'OTHER',
      index: true,
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    customerOrPayer: { type: String },
    referenceId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Income: Model<IIncomeDocument> =
  mongoose.models.Income || mongoose.model<IIncomeDocument>('Income', IncomeSchema);
