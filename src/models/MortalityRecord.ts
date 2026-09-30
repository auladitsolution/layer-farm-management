import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMortalityRecordDocument extends Document {
  date: string;
  flockId: mongoose.Types.ObjectId;
  flockName: string;
  shedName?: string;
  deadCount: number;
  suspectedReason?: string;
  notes?: string;
  photoUrl?: string;
  recordedByUid?: string;
  createdAt: Date;
}

const MortalityRecordSchema = new Schema<IMortalityRecordDocument>(
  {
    date: { type: String, required: true, index: true },
    flockId: { type: Schema.Types.ObjectId, ref: 'Flock', required: true, index: true },
    flockName: { type: String, required: true },
    shedName: { type: String },
    deadCount: { type: Number, required: true, min: 1 },
    suspectedReason: { type: String, default: 'স্বাভাবিক' },
    notes: { type: String },
    photoUrl: { type: String },
    recordedByUid: { type: String },
  },
  { timestamps: true }
);

export const MortalityRecord: Model<IMortalityRecordDocument> =
  mongoose.models.MortalityRecord ||
  mongoose.model<IMortalityRecordDocument>('MortalityRecord', MortalityRecordSchema);
