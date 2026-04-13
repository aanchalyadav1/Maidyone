import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  user: mongoose.Types.ObjectId;
  skills: mongoose.Types.ObjectId[];
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: { type: string; url: string }[];
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    isOnline: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    documents: [{ type: { type: String }, url: { type: String } }],
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IWorker>('Worker', WorkerSchema);
