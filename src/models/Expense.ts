import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface IExpenseDocument extends Document {
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  supplierOrPayee?: string;
  receiptUrl?: string;
  notes?: string;
  recordedByUid?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    date: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      default: 'FEED',
      index: true,
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    supplierOrPayee: { type: String },
    receiptUrl: { type: String },
    notes: { type: String },
    recordedByUid: { type: String },
  },
  { timestamps: true }
);

export const Expense: Model<IExpenseDocument> =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
