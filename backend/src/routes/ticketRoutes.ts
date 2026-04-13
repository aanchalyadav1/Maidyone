import { Router } from 'express';
import { getTickets, createTicket, getTicketById, updateTicketStatus } from '../controllers/ticketController';

const router = Router();

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicketStatus);

export default router;
