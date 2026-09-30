import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface ISupplierPaymentDocument extends Document {
  voucherNo: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  paidByUid?: string;
  paidByName?: string;
  createdAt: Date;
}

const SupplierPaymentSchema = new Schema<ISupplierPaymentDocument>(
  {
    voucherNo: { type: String, required: true, unique: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    supplierName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    transactionRef: { type: String },
    notes: { type: String },
    paidByUid: { type: String },
    paidByName: { type: String },
  },
  { timestamps: true }
);

export const SupplierPayment: Model<ISupplierPaymentDocument> =
  mongoose.models.SupplierPayment ||
  mongoose.model<ISupplierPaymentDocument>('SupplierPayment', SupplierPaymentSchema);
