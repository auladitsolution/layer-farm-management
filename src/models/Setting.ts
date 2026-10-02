import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingDocument extends Document {
  farmName: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  logoUrl?: string;
  currency: string;
  traySize: number;
  lowFeedThresholdKg: number;
  highMortalityThresholdPercent: number;
  medicineExpiryNoticeDays: number;
  enableGrading: boolean;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISettingDocument>(
  {
    farmName: { type: String, default: 'বিসমিল্লাহ লেয়ার ফার্ম' },
    ownerName: { type: String, default: 'ফার্ম মালিক' },
    phone: { type: String, default: '+880 1700-000000' },
    email: { type: String, default: 'contact@bismillahfarm.com' },
    address: { type: String, default: 'গাজীপুর, ঢাকা, বাংলাদেশ' },
    logoUrl: { type: String, default: '' },
    currency: { type: String, default: '৳ BDT' },
    traySize: { type: Number, default: 30 }, // Configurable tray size!
    lowFeedThresholdKg: { type: Number, default: 200 },
    highMortalityThresholdPercent: { type: Number, default: 1.5 },
    medicineExpiryNoticeDays: { type: Number, default: 30 },
    enableGrading: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Setting: Model<ISettingDocument> =
  mongoose.models.Setting || mongoose.model<ISettingDocument>('Setting', SettingSchema);
