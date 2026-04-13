import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBookingStatus, assignWorker } from '../controllers/bookingController';
// import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware here in reality.
// router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/assign-worker', assignWorker);

export default router;
