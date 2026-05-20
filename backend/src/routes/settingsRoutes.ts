import { Router } from 'express';
import { getAdminProfile, updateAdminProfile } from '../controllers/settingsController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);

export default router;
