import mongoose, { Schema, Document } from 'mongoose';

export type CouponDiscountType = 'percent' | 'flat';
export type CouponStatus = 'active' | 'inactive' | 'expired';
export type CouponAppliesTo = 'all' | 'service' | 'category';

export interface ICoupon extends Document {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  usageLimit?: number;
  usageCount: number;
  validFrom?: Date;
  validTo?: Date;
  appliesTo: CouponAppliesTo;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },

    discountType: {
      type: String,
      required: true,
      enum: ['percent', 'flat'],
    },
    discountValue: { type: Number, required: true, min: 0 },

    usageLimit: { type: Number, min: 0 },
    usageCount: { type: Number, default: 0 },

    validFrom: { type: Date },
    validTo: { type: Date, index: true },

    appliesTo: { type: String, enum: ['all', 'service', 'category'], default: 'all' },

    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema);

