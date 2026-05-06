import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBookingStatus, assignWorker } from '../controllers/bookingController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/assign-worker', assignWorker);

export default router;
