import { Router } from 'express';
import { getBanners, getBannerById, createBanner, updateBanner, deactivateBanner } from '../controllers/bannerController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getBanners);
router.post('/', authorize('admin'), createBanner);
router.get('/:id', validateObjectId, getBannerById);
router.put('/:id', authorize('admin'), validateObjectId, updateBanner);
router.delete('/:id', authorize('admin'), validateObjectId, deactivateBanner);

export default router;
