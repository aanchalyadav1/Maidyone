import { Router } from 'express';
import { getPayments, getPaymentStats, recordPayment, updatePaymentStatus } from '../controllers/paymentController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

// /stats must come before /:id to avoid Express matching 'stats' as an ObjectId
router.get('/stats', authorize('admin'), getPaymentStats);
router.get('/', getPayments);
router.post('/', authorize('admin'), recordPayment);
router.patch('/:id/status', authorize('admin'), validateObjectId, updatePaymentStatus);

export default router;
