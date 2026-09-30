import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod } from '@/types';

export interface ICustomerPaymentDocument extends Document {
  receiptNo: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  receivedByUid?: string;
  receivedByName?: string;
  createdAt: Date;
}

const CustomerPaymentSchema = new Schema<ICustomerPaymentDocument>(
  {
    receiptNo: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'],
      default: 'CASH',
    },
    transactionRef: { type: String },
    notes: { type: String },
    receivedByUid: { type: String },
    receivedByName: { type: String },
  },
  { timestamps: true }
);

export const CustomerPayment: Model<ICustomerPaymentDocument> =
  mongoose.models.CustomerPayment || mongoose.model<ICustomerPaymentDocument>('CustomerPayment', CustomerPaymentSchema);
