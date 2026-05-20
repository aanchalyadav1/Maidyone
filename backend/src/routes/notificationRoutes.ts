import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
// read-all must come before /:id/read to avoid 'read-all' being treated as an ObjectId
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validateObjectId, markAsRead);
router.delete('/:id', validateObjectId, deleteNotification);

export default router;
