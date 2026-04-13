import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string; // e.g. BK-7845
  user: mongoose.Types.ObjectId;
  worker?: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  date: Date;
  address: string;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', index: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'], 
      default: 'Pending',
      index: true 
    },
    date: { type: Date, required: true, index: true },
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
