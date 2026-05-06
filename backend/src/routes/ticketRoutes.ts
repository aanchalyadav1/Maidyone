import { Router } from 'express';
import { getTickets, createTicket, getTicketById, updateTicketStatus } from '../controllers/ticketController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.patch('/:id', authorize('admin'), updateTicketStatus);

export default router;
