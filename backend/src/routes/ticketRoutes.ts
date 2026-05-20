import { Router } from 'express';
import { getTickets, createTicket, getTicketById, updateTicketStatus } from '../controllers/ticketController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { validateObjectId } from '../middlewares/validate';

const router = Router();

router.use(protect);

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', validateObjectId, getTicketById);
router.patch('/:id', authorize('admin'), validateObjectId, updateTicketStatus);

export default router;
