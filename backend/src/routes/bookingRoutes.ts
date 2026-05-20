import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBookingStatus, assignWorker } from '../controllers/bookingController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', validateObjectId, getBookingById);
router.patch('/:id/status', authorize('admin'), validateObjectId, updateBookingStatus);
router.patch('/:id/assign-worker', authorize('admin'), validateObjectId, assignWorker);

export default router;
