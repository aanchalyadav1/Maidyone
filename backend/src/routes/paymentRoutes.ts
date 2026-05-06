import { Router } from 'express';
import { getPayments, recordPayment } from '../controllers/paymentController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getPayments);
router.post('/', authorize('admin'), recordPayment);

export default router;
