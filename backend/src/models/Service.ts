import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
