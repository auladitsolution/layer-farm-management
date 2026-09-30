import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployeeDocument extends Document {
  name: string;
  phone: string;
  role: string;
  monthlySalary: number;
  joiningDate: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    joiningDate: { type: String, required: true },
    address: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export const Employee: Model<IEmployeeDocument> =
  mongoose.models.Employee || mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
