import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVaccinationScheduleDocument extends Document {
  flockId: mongoose.Types.ObjectId;
  flockName: string;
  vaccineName: string;
  targetBirdAgeWeeks: number;
  scheduledDate: string;
  dose: string;
  route: 'EYE_DROP' | 'DRINKING_WATER' | 'INJECTION' | 'WING_WEB' | 'SPRAY';
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  administeredDate?: string;
  responsiblePerson?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinationScheduleSchema = new Schema<IVaccinationScheduleDocument>(
  {
    flockId: { type: Schema.Types.ObjectId, ref: 'Flock', required: true, index: true },
    flockName: { type: String, required: true },
    vaccineName: { type: String, required: true },
    targetBirdAgeWeeks: { type: Number, required: true },
    scheduledDate: { type: String, required: true, index: true },
    dose: { type: String, default: '১ মাত্রা (১ ডোজ)' },
    route: {
      type: String,
      enum: ['EYE_DROP', 'DRINKING_WATER', 'INJECTION', 'WING_WEB', 'SPRAY'],
      default: 'DRINKING_WATER',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'MISSED'],
      default: 'PENDING',
    },
    administeredDate: { type: String },
    responsiblePerson: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const VaccinationSchedule: Model<IVaccinationScheduleDocument> =
  mongoose.models.VaccinationSchedule ||
  mongoose.model<IVaccinationScheduleDocument>('VaccinationSchedule', VaccinationScheduleSchema);
