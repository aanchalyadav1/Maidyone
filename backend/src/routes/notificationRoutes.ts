import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getNotifications);

export default router;
