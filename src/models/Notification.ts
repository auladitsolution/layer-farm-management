import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationDocument extends Document {
  title: string;
  message: string;
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['WARNING', 'ALERT', 'INFO', 'SUCCESS'], default: 'INFO' },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
