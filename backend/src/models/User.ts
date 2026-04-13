import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  role: 'admin' | 'worker' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, index: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    role: { type: String, enum: ['admin', 'worker', 'user'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    address: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
