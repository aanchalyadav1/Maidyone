import { Router } from 'express';
import { getBanners, getBannerById, createBanner, updateBanner, deactivateBanner } from '../controllers/bannerController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getBanners);
router.post('/', authorize('admin'), createBanner);
router.get('/:id', getBannerById);
router.put('/:id', authorize('admin'), updateBanner);
router.delete('/:id', authorize('admin'), deactivateBanner);

export default router;
