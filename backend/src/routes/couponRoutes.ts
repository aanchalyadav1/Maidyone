import { Router } from 'express';
import { getCoupons, getCouponById, createCoupon, updateCoupon, deactivateCoupon } from '../controllers/couponController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getCoupons);
router.post('/', authorize('admin'), createCoupon);
router.get('/:id', getCouponById);
router.put('/:id', authorize('admin'), updateCoupon);
router.delete('/:id', authorize('admin'), deactivateCoupon);

export default router;
