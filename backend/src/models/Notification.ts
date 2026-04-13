import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'Booking' | 'Payment' | 'System' | 'Ticket';
  relatedId?: string; // Could be bookingId, ticketId etc for deep linking
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Booking', 'Payment', 'System', 'Ticket'], default: 'System' },
    relatedId: { type: String },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
