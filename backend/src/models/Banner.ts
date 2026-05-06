import mongoose, { Schema, Document } from 'mongoose';

export type BannerPlacement = 'Home' | 'Bookings' | 'Offers' | 'Dashboard';
export type BannerStatus = 'active' | 'inactive' | 'expired';

export interface IBanner extends Document {
  title: string;
  placement: BannerPlacement;
  imageUrl?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  validFrom?: Date;
  validTo?: Date;
  status: BannerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true, index: true },
    placement: { type: String, required: true, enum: ['Home', 'Bookings', 'Offers', 'Dashboard'], index: true },

    imageUrl: { type: String },
    ctaLabel: { type: String },
    ctaTarget: { type: String },

    validFrom: { type: Date },
    validTo: { type: Date, index: true },

    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBanner>('Banner', BannerSchema);

