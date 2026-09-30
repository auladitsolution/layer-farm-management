import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface IFeedPurchaseDocument extends Document {
  invoiceNo: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  feedItemId: mongoose.Types.ObjectId;
  feedName: string;
  date: string;
  bagCount: number;
  totalKg: number;
  pricePerKg: number;
  subTotal: number;
  transportCost: number;
  discount: number;
  totalCost: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: Date;
}

const FeedPurchaseSchema = new Schema<IFeedPurchaseDocument>(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    supplierName: { type: String, required: true },
    feedItemId: { type: Schema.Types.ObjectId, ref: 'FeedItem', required: true },
    feedName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    bagCount: { type: Number, required: true, min: 1 },
    totalKg: { type: Number, required: true, min: 1 },
    pricePerKg: { type: Number, required: true, min: 0 },
    subTotal: { type: Number, required: true, min: 0 },
    transportCost: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FeedPurchase: Model<IFeedPurchaseDocument> =
  mongoose.models.FeedPurchase || mongoose.model<IFeedPurchaseDocument>('FeedPurchase', FeedPurchaseSchema);
