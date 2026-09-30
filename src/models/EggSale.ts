import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface IEggSaleDocument extends Document {
  invoiceNo: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  date: string;
  unitType: 'PIECE' | 'DOZEN' | 'TRAY';
  quantityInUnit: number;
  conversionRateToPieces: number;
  totalPieces: number;
  unitPrice: number;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedByUid?: string;
  recordedByName?: string;
  createdAt: Date;
}

const EggSaleSchema = new Schema<IEggSaleDocument>(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    date: { type: String, required: true, index: true },
    unitType: { type: String, enum: ['PIECE', 'DOZEN', 'TRAY'], default: 'TRAY' },
    quantityInUnit: { type: Number, required: true, min: 0.1 },
    conversionRateToPieces: { type: Number, required: true, default: 30 },
    totalPieces: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subTotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    notes: { type: String },
    recordedByUid: { type: String },
    recordedByName: { type: String },
  },
  { timestamps: true }
);

export const EggSale: Model<IEggSaleDocument> =
  mongoose.models.EggSale || mongoose.model<IEggSaleDocument>('EggSale', EggSaleSchema);
