import { Router } from 'express';
import { getCoupons, getCouponById, createCoupon, updateCoupon, deactivateCoupon } from '../controllers/couponController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getCoupons);
router.post('/', authorize('admin'), createCoupon);
router.get('/:id', validateObjectId, getCouponById);
router.put('/:id', authorize('admin'), validateObjectId, updateCoupon);
router.delete('/:id', authorize('admin'), validateObjectId, deactivateCoupon);

export default router;
