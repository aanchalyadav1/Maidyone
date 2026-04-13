import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  method: 'Card' | 'Cash' | 'Wallet';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
      default: 'Pending',
      index: true
    },
    method: { type: String, enum: ['Card', 'Cash', 'Wallet'], default: 'Card' },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
